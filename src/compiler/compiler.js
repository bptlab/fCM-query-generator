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

export function copmileStateSpaceQuery(
  queryVariables,
  dataObjects,
  activities
) {
  let query = "";

  query += `${getStateCheckFunction(
    queryVariables,
    dataObjects,
    activities
  )}\n\n`;

  query += `${getPathCostFunction(queryVariables)}\n\n`;

  query += `${getBreadthFirstSearch(queryVariables)}\n\n`;

  return query;
}

function getStateCheckFunction(queryVariables, dataObjects, activities) {
  let helperFunctions = "";

  helperFunctions += getDataObjectStateFunctions(dataObjects);

  helperFunctions += getActivityFunctions(activities);

  let evaluationFunction = "fun evaluateObjectives (n) = (";

  queryVariables.objectives.forEach((objective, oIdx) => {
    const { functions, evaluation } = getObjectiveEvaluation(
      objective.conditions,
      objective.logicConcatenations,
      dataObjects
    );
    if (functions.length)
      // For each function, check whether the function was added before. If not, add it.
      helperFunctions += functions.reduce(
        (prev, current) =>
          prev +
          (helperFunctions.includes(` ${current.name} `) ||
          prev.includes(` ${current.name} `)
            ? ""
            : current.function),
        ""
      );
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
  // TODO: compile the actual path cost function
  if (!queryVariables.pathCostFunction) {
    return "fun pathCostFunction (path: int list) = (1.0 / Real.fromInt(List.length(path)));";
  }
  return "fun pathCostFunction (path: int list) = (1.0 / Real.fromInt(List.length(path)));";
}

function getBreadthFirstSearch(queryVariables) {
  const initialState = `val initialState = ${queryVariables.initialState ??
    1};`;
  return `${initialState}${breadthFirstSearch}`;
}

export function compileAskCTLFormula(
  name,
  dataObjects,
  activities,
  conditions,
  logicConcatenations
) {
  let formula = "";

  formula += getDataObjectStateFunctions(dataObjects);

  formula += getActivityFunctions(activities);

  const { functions, evaluation } = getObjectiveEvaluation(
    conditions,
    logicConcatenations,
    dataObjects
  );

  if (functions.length)
    formula += functions.reduce((prev, current) => {
      prev += formula.contains(` ${current.name} `) ? current.function : "";
    }, "");

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

function getActivityFunctions(activities) {
  let result = "";
  activities.forEach((activity) => {
    const taskFunction = getActivityFunction(activity);
    result += `${taskFunction}\n`;
  });
  return result;
}

function getActivityFunction(activity) {
  const name = getActivityFunctionName(activity.name);
  if (activity.inputOutputCombinations < 1) return `fun ${name} n = (false)\n`;
  let formula = `fun ${name} n = (if length(OutArcs(n)) <> 0 then
            (`;
  for (let i = 0; i < activity.inputOutputCombinations; i++) {
    formula += `List.exists(fn arc => ArcToTI(arc) = (TI.${replaceWhiteSpace(
      activity.name
    )}'${replaceWhiteSpace(activity.name)}_${i} 1)) (OutArcs(n))`;
    if (i < activity.inputOutputCombinations - 1) formula += "  orelse\n";
  }
  formula += `)\nelse false);`;
  return formula;
}

function getActivityFunctionName(taskName) {
  return `is${replaceWhiteSpace(taskName)}Enabled`;
}

function getObjectiveEvaluation(conditions, logicConcatenations, dataObjects) {
  let functions = [];
  let evaluation = "";
  conditions.forEach((condition, conditionIdx) => {
    let functionName =
      condition.type === "DATA_OBJECT"
        ? getDataObjectStateFunctionName(
            condition.selectedDataObjectState.name,
            condition.selectedDataObjectState.state
          )
        : getActivityFunctionName(condition.selectedActivity);
    if (condition.not) evaluation += " not(";
    if (condition.type === "DATA_OBJECT" && condition.quantor === "ALL") {
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
      functions.push({
        name: allFunctionName,
        function: `${allFunctionFormula}\n`,
      });
      evaluation += `${allFunctionName}(n)`;
    } else if (
      condition.type === "DATA_OBJECT" &&
      condition.quantor === "AMOUNT"
    ) {
      const {
        name: amountFunctionName,
        formula: amountFunctionFormula,
      } = getDataObjectStateAmountFunction(
        condition.selectedDataObjectState.name,
        condition.selectedDataObjectState.state,
        condition.amount.lowerBound,
        condition.amount.upperBound
      );
      functions.push({
        name: amountFunctionName,
        function: `${amountFunctionFormula}\n`,
      });
      evaluation += `${amountFunctionName}(n)`;
    } else evaluation += `${replaceWhiteSpace(functionName)}(n)`;
    if (condition.not) evaluation += " ) ";
    evaluation += ` ${logicConcatenations[conditionIdx] ?? ""} `;
  });
  return { functions, evaluation };
}
