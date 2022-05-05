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

export function copmileStateSpaceQueryFilterBased(
  name,
  objective,
  state,
  dataObjects,
  activities
) {
  return compileAskCTLFormula(name, objective, state, dataObjects, activities);
}

export function copmileStateSpaceQueryScoreBased(
  queryVariables,
  dataObjects,
  activities
) {
  let query = "open List;\n";

  query += `${getStateCheckFunction(
    queryVariables,
    dataObjects,
    activities
  )}\n\n`;

  query += `${getPathScoreFunction(queryVariables, dataObjects)}\n`;

  query += `${getBreadthFirstSearch(queryVariables)}\n\n`;

  return query;
}

function getStateCheckFunction(queryVariables, dataObjects, activities) {
  let helperFunctions = "";

  helperFunctions += getDataObjectStateFunctions(dataObjects);

  helperFunctions += getActivityFunctions(activities);

  let evaluationFunctions = "";

  let requiredEvaluationFunction = "fun areRequiredObjectivesSatisfied (n) = (";

  queryVariables.objectiveConfigs.forEach((objectiveConfig, oIdx) => {
    const { functions, evaluation } = getObjectiveEvaluation(
      objectiveConfig.objective.conditions,
      objectiveConfig.objective.logicConcatenations,
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

    const evalFunctionName = `is${replaceWhiteSpace(
      objectiveConfig.objective.name
    )}Satisfied`;
    evaluationFunctions += `fun ${evalFunctionName} (n) = (${evaluation});\n`;

    const weight = parseFloat(objectiveConfig.weight / 100).toLocaleString(
      "en",
      {
        useGrouping: false,
        minimumFractionDigits: 1,
      }
    );
    evaluationFunctions += `fun get${replaceWhiteSpace(
      objectiveConfig.objective.name
    )}Score (n) =  (if (${evalFunctionName}(n)) then (${weight}) else (0.0));\n`;

    if (objectiveConfig.required) {
      requiredEvaluationFunction += `is${replaceWhiteSpace(
        objectiveConfig.objective.name
      )}Satisfied(n)`;
    } else {
      requiredEvaluationFunction += "true";
    }
    if (oIdx < queryVariables.objectiveConfigs.length - 1)
      requiredEvaluationFunction += " andalso ";
  });

  requiredEvaluationFunction += ");";

  return (
    helperFunctions + `\n` + evaluationFunctions + requiredEvaluationFunction
  );
}

function getDOCostFunctions(queryVariables, dataObjects) {
  let amountFunctions = "";
  let costFunctions = "";
  let functionCombination = "fun getDOCosts(path: int list) = (";
  dataObjects.forEach((object) => {
    const weight = parseFloat(
      queryVariables.pathCostFunction.dataObjectCosts.find(
        (objectCost) => objectCost.dataObject === object.name
      )?.value
    ).toLocaleString("en", { useGrouping: false, minimumFractionDigits: 1 });
    if (!weight) return;

    object.states.forEach((state) => {
      const amountFunctionName = `${replaceWitheSpaceAndLowerCase(
        object.name
      )}${replaceWhiteSpaceAndCapitalize(state.name)}`;

      amountFunctions += `fun getAmount${amountFunctionName} (n) = (length(Mark.${mainPage}'${replaceWitheSpaceAndLowerCase(
        object.name
      )}__${replaceWhiteSpaceAndCapitalize(state.name)} 1 n));\n`;

      costFunctions += `fun getCost${amountFunctionName} (path: int list) = (Real.fromInt(getAmount${amountFunctionName}( DestNode(List.last(path)) ) - getAmount${amountFunctionName}( ${queryVariables.initialState} )) * ${weight});\n`;

      functionCombination += `getCost${amountFunctionName} (path) + `;
    });
  });
  functionCombination += "0.0);\n";
  return amountFunctions + costFunctions + functionCombination;
}

function getActivityCostFunctions(queryVariables) {
  let functions = "fun getActivityCost (t) = ( ";

  queryVariables.pathCostFunction.activityCosts.forEach(
    (activityCost, costIdx) => {
      if (costIdx) functions += "else ";
      functions += `if ( String.isSubstring(st_TI(ArcToTI(t)))( "${replaceWhiteSpace(
        activityCost.name
      )}" ) ) then (${parseFloat(activityCost.value).toLocaleString("en", {
        useGrouping: false,
        minimumFractionDigits: 1,
      })})\n`;
    }
  );
  functions += "else (0.0));\n";

  functions += `fun sumListRec [] = 0.0
    | sumListRec (x::xs) = x + (sumListRec xs)\n`;

  functions += `fun getActivityCosts(path: int list) = sumListRec(List.map(fn (transition) => (getActivityCost(transition)))(path));\n`;

  return functions;
}

function getPathScoreFunction(queryVariables, dataObjects) {
  let scoreFunction = "fun getPathScore(path: int list, n: int) = ((";

  queryVariables.objectiveConfigs.forEach((objectiveConfig, oIdx) => {
    scoreFunction += `get${replaceWhiteSpace(
      objectiveConfig.objective.name
    )}Score(n)`;
    if (oIdx < queryVariables.objectiveConfigs.length - 1)
      scoreFunction += " + ";
  });

  const functions = getPathCostFunction(queryVariables, dataObjects);

  scoreFunction += `) / pathCostFunction(path));\n`;

  return functions + scoreFunction;
}

function getPathCostFunction(queryVariables, dataObjects) {
  if (!queryVariables.pathCostFunction) {
    return "fun pathCostFunction (path: int list) = (1.0 / Real.fromInt(List.length(path)));";
  }
  // TODO: compile the Amount functions for each DO state
  let functions = getDOCostFunctions(queryVariables, dataObjects);

  functions += getActivityCostFunctions(queryVariables);

  if (queryVariables.pathCostFunction.length.weight === "length")
    functions += `fun getLengthCost (path: int list) = (Real.fromInt(List.length(path)) );\n`;
  else if (queryVariables.pathCostFunction.length.weight === "squared")
    functions += `fun getLengthCost (path: int list) = (Real.fromInt(List.length(path)) * Real.fromInt(List.length(path)));\n`;
  else functions += `fun getLengthCost (path: int list) = (0.0);\n`;

  functions += `fun pathCostFunction (path: int list) = (( getLengthCost(path) ${
    queryVariables.pathCostFunction.length.concatenation === "addition"
      ? "+"
      : "*"
  } (getDOCosts(path) + getActivityCosts(path))));\n`;
  return functions;
}

function getBreadthFirstSearch(queryVariables) {
  const initialState = `val initialState = ${queryVariables.initialState ??
    1};`;
  return `${initialState}${breadthFirstSearch}`;
}

export function compileAskCTLFormula(
  name,
  objective,
  state,
  dataObjects,
  activities
) {
  let formula = `use(ogpath^"ASKCTL/ASKCTLloader.sml");`;

  formula += getDataObjectStateFunctions(dataObjects);

  formula += getActivityFunctions(activities);

  const { functions, evaluation } = getObjectiveEvaluation(
    objective.conditions,
    objective.logicConcatenations,
    dataObjects
  );

  functions.forEach((helperFunction) => {
    if (!formula.includes(helperFunction.name))
      formula += helperFunction.function;
  });

  formula += `fun evaluateState n = (${evaluation});\n`;

  const objectiveFunction = `val Objective = POS(NF("${replaceWhiteSpace(
    name
  )}", evaluateState));`;

  const evaluate = `fun evaluateNode a = 
    let val destNode = DestNode(a)
    in eval_node Objective destNode
  end
  val nextArcs: int list ref = ref [];
  val results: (TI.TransInst * bool) list ref = ref([]);
  nextArcs := OutArcs(${state});
  results := List.map(fn (action) => (
      (ArcToTI(action), evaluateNode(action) )
  ))(!nextArcs);
  results;`;

  formula += objectiveFunction + `\n` + evaluate;
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
    const activityFunction = getActivityFunction(activity);
    result += `${activityFunction}\n`;
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

function getActivityFunctionName(activityName) {
  return `is${replaceWhiteSpace(activityName)}Enabled`;
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
