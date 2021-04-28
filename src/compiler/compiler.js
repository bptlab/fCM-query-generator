function replaceWhiteSpace(input) {
    if (!input) return ''
    return input.replace(' ', '_')
}

export function compileAskCTLFormula(name, conditions, logicConcatenations) {
    let formula = "";

    const mainPage = "Main_Page"

    let evaluateStateFunction = `fun evaluateState n = (`

    conditions.forEach((condition, conditionIdx) => {
        const conditionFunction = condition.type === "DATA_OBJECT" ? getDataObjectFunction(condition, mainPage) : getTaskFunction(condition, mainPage)
        formula += `${conditionFunction.formula}\n`
        if (condition.not) evaluateStateFunction += ' not('
        evaluateStateFunction += `${replaceWhiteSpace(conditionFunction.name)}(n)`
        if (condition.not) evaluateStateFunction += ' ) '
        evaluateStateFunction += ` ${logicConcatenations[conditionIdx] ? `${logicConcatenations[conditionIdx]}ALSO` : ''} `
    })

    evaluateStateFunction += ');'

    const objective = `val Objective = POS(NF("${replaceWhiteSpace(name)}", evaluateState));`

    const evaluate = 'eval_node Objective <current state>;'

    formula += evaluateStateFunction + `\n` + objective + `\n` + evaluate
    return formula;
}

function getDataObjectFunction(condition, mainPage) {
    const name = `${replaceWhiteSpace(condition.selectedDataObjectState.name)}Has${replaceWhiteSpace(condition.selectedDataObjectState.state)}`
    const formula = `fun ${name} n =
            (if length(Mark.${mainPage}'${replaceWhiteSpace(condition.selectedDataObjectState.name)} 1 n) <> 0
            then
            (List.${condition.quantor === "EXISTS" ? 'exists' : 'all'}(fn d => #state(d) = ${replaceWhiteSpace(condition.selectedDataObjectState.state)}) (Mark.${mainPage}'${replaceWhiteSpace(condition.selectedDataObjectState.name)}__${replaceWhiteSpace(condition.selectedDataObjectState.state)} 1 n))
            else
            false);\n`

    return {
        name,
        formula
    }
}

function getTaskFunction(condition) {
    const name = `is${replaceWhiteSpace(condition.selectedTask)}Enabled`
    const formula = `fun ${name} n =
            (if length(OutArcs(n)) <> 0
            then
            (List.exists(fn arc => ArcToTI(arc) = (TI.${replaceWhiteSpace(condition.selectedTask)}'${replaceWhiteSpace(condition.selectedTask)} 1)) (OutArcs(n)))
            else
            false);\n`
    return {
        name,
        formula
    }
}