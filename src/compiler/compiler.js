function replaceWhiteSpace(input) {
  if (!input) return "";
  return input.replaceAll(" ", "_").replaceAll("\n", "_");
}

function replaceWhiteSpaceAndCapitalize(input) {
  if (!input) return "";
  return replaceWhiteSpace(input.toUpperCase());
}

export function compileAskCTLFormula(
  name,
  dataObjects,
  tasks,
  conditions,
  logicConcatenations
) {
  let formula = "";

  const mainPage = "Main_Page";

  dataObjects.forEach((dataObject) =>
    dataObject.states.forEach((state) => {
      const dataObjectStateFunction = getDataObjectStateFunction(
        dataObject,
        state,
        mainPage
      );
      formula += `${dataObjectStateFunction}\n`;
    })
  );

  tasks.forEach((task) => {
    const taskFunction = getTaskFunction(task, mainPage);
    formula += `${taskFunction}\n`;
  });

  let evaluateStateFunction = `fun evaluateState n = (`;

  conditions.forEach((condition, conditionIdx) => {
    let functionName =
      condition.type === "DATA_OBJECT"
        ? getDataObjectStateFunctionName(
            condition.selectedDataObjectState.name,
            condition.selectedDataObjectState.state,
            mainPage
          )
        : getTaskFunctionName(condition.selectedTask, mainPage);
    if (condition.not) evaluateStateFunction += " not(";
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
          condition.selectedDataObjectState.state,
          mainPage
        );
        formula += `${allFunctionFormula}\n`;
        evaluateStateFunction += `${replaceWhiteSpace(allFunctionName)}(n)`;
      }
      if (condition.quantor === "AMOUNT") {
        const {
          name: amountFunctionName,
          formula: amountFunctionFormula,
        } = getDataObjectStateAmountFunction(
          condition.selectedDataObjectState.name,
          condition.selectedDataObjectState.state,
          condition.amount.lowerBound,
          condition.amount.upperBound,
          mainPage
        );
        formula += `${amountFunctionFormula}\n`;
        evaluateStateFunction += `${replaceWhiteSpace(amountFunctionName)}(n)`;
      }
    } else evaluateStateFunction += `${replaceWhiteSpace(functionName)}(n)`;
    if (condition.not) evaluateStateFunction += " ) ";
    evaluateStateFunction += ` ${logicConcatenations[conditionIdx] ?? ""} `;
  });

  evaluateStateFunction += ");";

  const objective = `val Objective = POS(NF("${replaceWhiteSpace(
    name
  )}", evaluateState));`;

  const evaluate = "eval_node Objective <current state>;";

  formula += evaluateStateFunction + `\n` + objective + `\n` + evaluate;
  return formula;
}

function getDataObjectStateFunction(dataObject, state, mainPage) {
  const name = getDataObjectStateFunctionName(dataObject.name, state.name);
  const formula = `fun ${name} n = (length(Mark.${mainPage}'${replaceWhiteSpace(
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
  upperBound,
  mainPage
) {
  const name = `${replaceWhiteSpace(
    dataObject
  )}Has${lowerBound}To${upperBound}${replaceWhiteSpace(state)}`;

  const lowerBoundCondition = `length(Mark.${mainPage}'${replaceWhiteSpace(
    dataObject
  )}__${replaceWhiteSpaceAndCapitalize(state)} 1 n) >= ${lowerBound}`;

  const upperBoundCondition = `length(Mark.${mainPage}'${replaceWhiteSpace(
    dataObject
  )}__${replaceWhiteSpaceAndCapitalize(state)} 1 n) <= ${upperBound}`;

  let formula = `fun ${name} n = (`;

  if ((!lowerBound && !upperBound) || lowerBound > upperBound) {
    formula += "false";
  } else if (!!lowerBound && !!upperBound) {
    formula += `(${lowerBoundCondition}) andalso (${upperBoundCondition})`;
  } else if (!!lowerBound && !upperBound) {
    formula += `${lowerBoundCondition}`;
  } else if (!lowerBound && !!upperBound) {
    formula += `${upperBoundCondition}`;
  }

  formula += ");";

  return { name, formula };
}

function getDataObjectOnlyStateFunction(dataObject, onlyState, mainPage) {
  const name = `${replaceWhiteSpace(dataObject.name)}HasOnly${replaceWhiteSpace(
    onlyState
  )}`;
  let formula = `fun ${name} n = (`;

  dataObject.states.forEach((state, stateIdx) => {
    if (state.name === onlyState)
      formula += `${getDataObjectStateFunctionName(
        dataObject.name,
        state.name,
        mainPage
      )}(n)`;
    else
      formula += `not(${getDataObjectStateFunctionName(
        dataObject.name,
        state.name,
        mainPage
      )}(n))`;

    if (dataObject.states.length > stateIdx + 1) formula += " andalso ";
  });

  formula += ");";

  return {
    name,
    formula,
  };
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
