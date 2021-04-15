function replaceWhiteSpace(input) {
    return input.replace(' ', '_')
}

export function compileAskCTLFormula(name, conditions, logicConcatenations) {
    let formula = "";

    const mainPage = "Main_Page"

    let conditionFunctions = ""

    let evaluateStateFunction = `fun evaluateState n = (`

    conditions.forEach((condition, conditionIdx) => {
        if (condition.type === "DATA_OBJECT") {
            const dataObjectFunction = getDataObjectFunction(condition, mainPage)

        }
    })

    // const dataObjectFunctions = getDataObjectFunctions(conditions, mainPage)
    // const taskFunctions = getTaskFunctions(conditions, mainPage)

    let idx = 0
    dataObjectFunctions.forEach(dataObjectFunction => {
        if (idx !== 0) evaluateStateFunction += ' andalso ' //TODO check concatenations for AND/OR and not
        idx += 1
        evaluateStateFunction += `${replaceWhiteSpace(dataObjectFunction.name)}(n)`
        formula += `${dataObjectFunction.formula}\n`
    })

    taskFunctions.forEach(taskFunction => {
        if (idx !== 0) evaluateStateFunction += ' andalso '
        idx += 1
        evaluateStateFunction += `${replaceWhiteSpace(taskFunction.name)}(n)`
        formula += `${taskFunction.formula}\n`
    })

    evaluateStateFunction += ');'

    const objective = `val Objective = POS(NF("${replaceWhiteSpace(name)}", evaluateState));`

    const evaluate = 'eval_node Objective <current state>;'

    formula += evaluateStateFunction + `\n` + objective + `\n` + evaluate
    return formula;
}

function getDataObjectFunction(condition, mainPage) {
    let functions = []
    dataObjectStates.forEach(dataObjectState => {
        const name = `${replaceWhiteSpace(dataObjectState.name)}Has${replaceWhiteSpace(dataObjectState.state)}`
        const formula = `fun ${name} n =
            (if length(Mark.${mainPage}'${replaceWhiteSpace(dataObjectState.name)} 1 n) <> 0
            then
            (List.exists(fn d => #state(d) = ${replaceWhiteSpace(dataObjectState.state)}) (Mark.${mainPage}'${replaceWhiteSpace(dataObjectState.name)} 1 n))
            else
            false);\n`
        functions.push({
            name,
            formula
        })
    });
    return functions
}

function getTaskFunction(condition) {
    let functions = []
    tasks.forEach(task => {
        const name = `is${replaceWhiteSpace(task)}Enabled`
        const formula = `fun ${name} n =
            (if length(OutArcs(n)) <> 0
            then
            (List.exists(fn arc => ArcToTI(arc) = (TI.${replaceWhiteSpace(task)}'${replaceWhiteSpace(task)} 1)) (OutArcs(n)))
            else
            false);\n`
        functions.push({
            name,
            formula
        })
    });
    return functions
}