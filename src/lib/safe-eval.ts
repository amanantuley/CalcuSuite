const precedence: { [key: string]: number } = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3,
};

const isOperator = (token: string): boolean => {
  return ['+', '-', '*', '/', '^'].includes(token);
};

const toPostfix = (infix: string): string[] => {
  const outputQueue: string[] = [];
  const operatorStack: string[] = [];
  
  // Regex to tokenize numbers, operators, and parentheses
  const tokens = infix.match(/(\d+\.?\d*|\.\d+|[+\-*/^()])/g);
  if (!tokens) {
      throw new Error("Invalid characters in expression");
  }

  tokens.forEach(token => {
    if (!isNaN(parseFloat(token))) { // It's a number
      outputQueue.push(token);
    } else if (isOperator(token)) {
      while (
        operatorStack.length > 0 &&
        isOperator(operatorStack[operatorStack.length - 1]) &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue.push(operatorStack.pop()!);
      }
      if (operatorStack[operatorStack.length - 1] === '(') {
        operatorStack.pop(); // Pop the '('
      } else {
        throw new Error("Mismatched parentheses");
      }
    }
  });

  while (operatorStack.length > 0) {
    const op = operatorStack.pop()!;
    if (op === '(' || op === ')') throw new Error("Mismatched parentheses");
    outputQueue.push(op);
  }

  return outputQueue;
};

const evaluatePostfix = (postfix: string[]): number => {
  const stack: number[] = [];
  postfix.forEach(token => {
    if (!isNaN(parseFloat(token))) {
      stack.push(parseFloat(token));
    } else if (isOperator(token)) {
      if (stack.length < 2) throw new Error("Invalid expression");
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token) {
        case '+': stack.push(a + b); break;
        case '-': stack.push(a - b); break;
        case '*': stack.push(a * b); break;
        case '/': 
          if (b === 0) throw new Error("Division by zero");
          stack.push(a / b); 
          break;
        case '^': stack.push(Math.pow(a, b)); break;
      }
    }
  });

  if (stack.length !== 1) throw new Error("Invalid expression");
  return stack[0];
};

export const safeEval = (expression: string, variables: Record<string, number>): number => {
  // Replace variables with their numeric values
  let replacedExpression = expression;
  // Sort variables by length descending to avoid partial replacements (e.g., 'a' in 'ab')
  const sortedVars = Object.keys(variables).sort((a, b) => b.length - a.length);

  for (const v of sortedVars) {
    // Regex to replace variable only if it's a whole word
    const regex = new RegExp(`\\b${v}\\b`, 'g');
    replacedExpression = replacedExpression.replace(regex, String(variables[v]));
  }
  
  // Add spaces around operators to help with tokenization if they are missing
  replacedExpression = replacedExpression.replace(/([+\-*/^()])/g, ' $1 ');

  const postfix = toPostfix(replacedExpression);
  return evaluatePostfix(postfix);
};
