import { breadthFirstSearch } from "../utils/stateSpaceQuery";

const mainPage = "Main_Page";

function replaceWhiteSpace(input) {
  if (!input) return "";
  return input.replaceAll(" ", "_").replaceAll("\n", "_");
}

function replaceWhiteSpaceAndCapitalize(input) {
  if (!input) return "";
  return replaceWhiteSpace(input.toUpperCase());
}

function replaceWitheSpaceAndLowerCase(input) {
  if (!input) return "";
  return replaceWhiteSpace(input.toLowerCase());
}

export function copmileStateSpaceQuery(queryVariables, dataObjects, tasks) {
  let query = "";

  query += `${getStateCheckFunction(queryVariables, dataObjects, tasks)}\n\n`;

  query += `${getPathCostFunction(queryVariables)}\n\n`;

  query += `${getBreadthFirstSearch(queryVariables)}\n\n`;

  return query;
}

function getStateCheckFunction(queryVariables, dataObjects, tasks) {
  let helperFunctions = "";

  helperFunctions += getDataObjectStateFunctions(dataObjects);

  helperFunctions += getTaskFunctions(tasks);

  let evaluationFunction = "fun evaluateObjectives (n) = (";

  queryVariables.objectives.forEach((objective, oIdx) => {
    const { formulas, evaluation } = getObjectiveEvaluation(
      objective.conditions,
      objective.logicConcatenations,
      dataObjects
    );
    if (formulas) helperFunctions += formulas;
    evaluationFunction += "(" + evaluation + ")";
    if (oIdx < queryVariables.objectives.length - 1)
      evaluationFunction += " andalso ";
  });

  evaluationFunction += ");";

  return (
    helperFunctions +
    `\n` +
    evaluationFunction +
    `\n` +
    `fun areObjectivesSatisfied (path: int list) = evaluateObjectives(List.last(path));  `
  );
}

function getPathCostFunction(queryVariables) {
  if (!queryVariables.pathCostFunction) {
    return "fun pathCostFunction (path: int list) = (1.0 / Real.fromInt(List.length(path)));";
  }
  return "...";
}

function getBreadthFirstSearch(queryVariables) {
  const initialState = `val initialState = ${queryVariables.initialState ??
    1};`;
  return `${initialState}${breadthFirstSearch}`;
}

export function compileAskCTLFormula(
  name,
  dataObjects,
  tasks,
  conditions,
  logicConcatenations
) {
  let formula = "";

  formula += getDataObjectStateFunctions(dataObjects);

  formula += getTaskFunctions(tasks);

  const { formulas, evaluation } = getObjectiveEvaluation(
    conditions,
    logicConcatenations,
    dataObjects
  );

  formula += formulas;

  formula += `fun evaluateState n = (${evaluation});`;

  const objective = `val Objective = POS(NF("${replaceWhiteSpace(
    name
  )}", evaluateState));`;

  const evaluate = "eval_node Objective <current state>;";

  formula += objective + `\n` + evaluate;
  return formula;
}

function getDataObjectStateFunctions(dataObjects) {
  let result = "";
  dataObjects.forEach((dataObject) =>
    dataObject.states.forEach((state) => {
      const dataObjectStateFunction = getDataObjectStateFunction(
        dataObject,
        state
      );
      result += `${dataObjectStateFunction}\n`;
    })
  );
  return result;
}

function getDataObjectStateFunction(dataObject, state) {
  const name = getDataObjectStateFunctionName(dataObject.name, state.name);
  const formula = `fun ${name} n = (length(Mark.${mainPage}'${replaceWitheSpaceAndLowerCase(
    dataObject.name
  )}__${replaceWhiteSpaceAndCapitalize(state.name)} 1 n) <> 0);`;

  return formula;
}

function getDataObjectStateFunctionName(dataObjectName, stateName) {
  return `${replaceWhiteSpace(dataObjectName)}Has${replaceWhiteSpace(
    stateName
  )}`;
}

function getDataObjectStateAmountFunction(
  dataObject,
  state,
  lowerBound,
  upperBound
) {
  const name = `${replaceWhiteSpace(
    dataObject
  )}Has${lowerBound}To${upperBound}${replaceWhiteSpace(state)}`;

  const lowerBoundCondition = `length(Mark.${mainPage}'${replaceWitheSpaceAndLowerCase(
    dataObject
  )}__${replaceWhiteSpaceAndCapitalize(state)} 1 n) >= ${lowerBound}`;

  const upperBoundCondition = `length(Mark.${mainPage}'${replaceWitheSpaceAndLowerCase(
    dataObject
  )}__${replaceWhiteSpaceAndCapitalize(state)} 1 n) <= ${upperBound}`;

  let formula = `fun ${name} n = (`;

  if (
    (!lowerBound && !upperBound) ||
    (!!lowerBound && !!upperBound && lowerBound > upperBound)
  ) {
    formula += "false";
  } else if (!!lowerBound && !!upperBound) {
    formula += `(${lowerBoundCondition}) andalso (${upperBoundCondition})`;
  } else if (!!lowerBound && !upperBound) {
    formula += `${lowerBoundCondition}`;
  } else if (!lowerBound && !!upperBound) {
    formula += `${upperBoundCondition}`;
  }

  formula += ");";

  return {
    name,
    formula,
  };
}

function getDataObjectOnlyStateFunction(dataObject, onlyState) {
  const name = `${replaceWhiteSpace(dataObject.name)}HasOnly${replaceWhiteSpace(
    onlyState
  )}`;
  let formula = `fun ${name} n = (`;

  dataObject.states.forEach((state, stateIdx) => {
    if (state.name === onlyState)
      formula += `${getDataObjectStateFunctionName(
        dataObject.name,
        state.name
      )}(n)`;
    else
      formula += `not(${getDataObjectStateFunctionName(
        dataObject.name,
        state.name
      )}(n))`;

    if (dataObject.states.length > stateIdx + 1) formula += " andalso ";
  });

  formula += ");";

  return {
    name,
    formula,
  };
}

function getTaskFunctions(tasks) {
  let result = "";
  tasks.forEach((task) => {
    const taskFunction = getTaskFunction(task);
    result += `${taskFunction}\n`;
  });
  return result;
}

function getTaskFunction(task) {
  const name = getTaskFunctionName(task.name);
  if (task.inputOutputCombinations < 1) return `fun ${name} n = (false)\n`;
  let formula = `fun ${name} n = (if length(OutArcs(n)) <> 0 then
            (`;
  for (let i = 0; i < task.inputOutputCombinations; i++) {
    formula += `List.exists(fn arc => ArcToTI(arc) = (TI.${replaceWhiteSpace(
      task.name
    )}'${replaceWhiteSpace(task.name)}_${i} 1)) (OutArcs(n))`;
    if (i < task.inputOutputCombinations - 1) formula += "  orelse\n";
  }
  formula += `)\nelse false);`;
  return formula;
}

function getTaskFunctionName(taskName) {
  return `is${replaceWhiteSpace(taskName)}Enabled`;
}

function getObjectiveEvaluation(conditions, logicConcatenations, dataObjects) {
  let functions = "";
  let evaluation = "";
  conditions.forEach((condition, conditionIdx) => {
    let functionName =
      condition.type === "DATA_OBJECT"
        ? getDataObjectStateFunctionName(
            condition.selectedDataObjectState.name,
            condition.selectedDataObjectState.state
          )
        : getTaskFunctionName(condition.selectedTask);
    if (condition.not) evaluation += " not(";
    if (condition.type === "DATA_OBJECT") {
      if (condition.quantor === "ALL") {
        const {
          name: allFunctionName,
          formula: allFunctionFormula,
        } = getDataObjectOnlyStateFunction(
          dataObjects.find(
            (dataObject) =>
              dataObject.name === condition.selectedDataObjectState.name
          ),
          condition.selectedDataObjectState.state
        );
        functions += `${allFunctionFormula}\n`;
        evaluation += `${replaceWhiteSpace(allFunctionName)}(n)`;
      }
      if (condition.quantor === "AMOUNT") {
        const {
          name: amountFunctionName,
          formula: amountFunctionFormula,
        } = getDataObjectStateAmountFunction(
          condition.selectedDataObjectState.name,
          condition.selectedDataObjectState.state,
          condition.amount.lowerBound,
          condition.amount.upperBound
        );
        functions += `${amountFunctionFormula}\n`;
        evaluation += `${replaceWhiteSpace(amountFunctionName)}(n)`;
      }
    } else evaluation += `${replaceWhiteSpace(functionName)}(n)`;
    if (condition.not) evaluation += " ) ";
    evaluation += ` ${logicConcatenations[conditionIdx] ?? ""} `;
  });
  return { functions, evaluation };
}
