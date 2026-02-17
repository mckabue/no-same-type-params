/**
 * ESLint rule: no-same-type-params
 *
 * Disallows 2+ consecutive function parameters that share the same type annotation.
 * This catches error-prone signatures like `copy(source: string, dest: string, adapterId: string)`
 * and encourages refactoring to object parameters: `copy({ source, dest, adapterId })`.
 *
 * Works with TypeScript type annotations only — untyped parameters are ignored.
 */

const getParamName = (param: any): string => {
  // Identifier: (a: string)
  if (param.type === 'Identifier') {
    return param.name
  }
  // AssignmentPattern: (a: string = 'default')
  if (param.type === 'AssignmentPattern' && param.left?.type === 'Identifier') {
    return param.left.name
  }
  // RestElement: (...args: string[])
  if (param.type === 'RestElement' && param.argument?.type === 'Identifier') {
    return `...${param.argument.name}`
  }
  return '?'
}

const getTypeAnnotation = (param: any): any => {
  // Direct type annotation: (a: string)
  if (param.typeAnnotation?.typeAnnotation) {
    return param.typeAnnotation.typeAnnotation
  }
  // AssignmentPattern: (a: string = 'default')
  if (param.type === 'AssignmentPattern' && param.left?.typeAnnotation?.typeAnnotation) {
    return param.left.typeAnnotation.typeAnnotation
  }
  return undefined
}

const noSameTypeParams = {
  meta: {
    type: 'suggestion' as const,
    docs: {
      description: 'Disallow consecutive function parameters with the same type annotation',
    },
    schema: [],
    messages: {
      sameTypeParams:
        'Consecutive parameters {{params}} share the same type "{{type}}". Consider using an object parameter instead.',
    },
  },
  create(context: any) {
    const checkParams = (params: any[]) => {
      if (params.length < 2) return

      for (let i = 1; i < params.length; i++) {
        const prev = params[i - 1]
        const curr = params[i]

        const prevTypeNode = getTypeAnnotation(prev)
        const currTypeNode = getTypeAnnotation(curr)

        // Both params must have type annotations to compare
        if (!prevTypeNode || !currTypeNode) continue

        const prevType = context.sourceCode.getText(prevTypeNode)
        const currType = context.sourceCode.getText(currTypeNode)

        if (prevType === currType) {
          context.report({
            node: curr,
            messageId: 'sameTypeParams',
            data: {
              params: `"${getParamName(prev)}" and "${getParamName(curr)}"`,
              type: currType,
            },
          })
        }
      }
    }

    return {
      FunctionDeclaration(node: any) { checkParams(node.params) },
      FunctionExpression(node: any) { checkParams(node.params) },
      ArrowFunctionExpression(node: any) { checkParams(node.params) },
    }
  },
}

export default noSameTypeParams
