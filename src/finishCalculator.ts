export type FinishOption = {
  description: string;
  throws: Array<{ number: number; multiplier: number }>;
}

export const calculateFinishOptions = (remainingScore: number, doubleOut: boolean, dartsRemaining: number = 3): FinishOption[] => {
  if (remainingScore <= 0 || remainingScore === 1) return [];
  
  const options: FinishOption[] = [];
  
  // Single dart finishes (only if at least 1 dart remaining)
  if (dartsRemaining >= 1) {
    if (remainingScore <= 40 && remainingScore % 2 === 0) {
      const doubleNumber = remainingScore / 2;
      if (doubleNumber >= 1 && doubleNumber <= 20) {
        options.push({
          description: `D${doubleNumber}`,
          throws: [{ number: doubleNumber, multiplier: 2 }]
        });
      }
    }
    
    if (remainingScore === 50) {
      options.push({
        description: "Bull",
        throws: [{ number: 50, multiplier: 1 }]
      });
    }
    
    if (!doubleOut && remainingScore <= 60) {
      // Single number finishes (when double out is disabled)
      if (remainingScore <= 20) {
        options.push({
          description: `${remainingScore}`,
          throws: [{ number: remainingScore, multiplier: 1 }]
        });
      }
      // Triple finishes
      if (remainingScore <= 60 && remainingScore % 3 === 0) {
        const tripleNumber = remainingScore / 3;
        if (tripleNumber >= 1 && tripleNumber <= 20) {
          options.push({
            description: `T${tripleNumber}`,
            throws: [{ number: tripleNumber, multiplier: 3 }]
          });
        }
      }
    }
  }
  
  // Two dart finishes (only if at least 2 darts remaining)
  if (dartsRemaining >= 2 && remainingScore <= 110) {
    // Try all combinations of first dart (singles, doubles, triples) + finishing double
    for (let firstNumber = 1; firstNumber <= 20; firstNumber++) {
      for (let firstMultiplier = 1; firstMultiplier <= 3; firstMultiplier++) {
        const firstScore = firstNumber * firstMultiplier;
        if (firstScore >= remainingScore) continue;
        
        const remaining = remainingScore - firstScore;
        
        // Check if remaining can be finished with a double
        if (remaining <= 40 && remaining % 2 === 0 && remaining >= 2) {
          const doubleNumber = remaining / 2;
          if (doubleNumber >= 1 && doubleNumber <= 20) {
            const firstDesc = firstMultiplier === 1 ? `${firstNumber}` : 
                            firstMultiplier === 2 ? `D${firstNumber}` : `T${firstNumber}`;
            options.push({
              description: `${firstDesc}→D${doubleNumber}`,
              throws: [
                { number: firstNumber, multiplier: firstMultiplier },
                { number: doubleNumber, multiplier: 2 }
              ]
            });
          }
        }
        
        // Check bullseye finish
        if (remaining === 50) {
          const firstDesc = firstMultiplier === 1 ? `${firstNumber}` : 
                          firstMultiplier === 2 ? `D${firstNumber}` : `T${firstNumber}`;
          options.push({
            description: `${firstDesc}→Bull`,
            throws: [
              { number: firstNumber, multiplier: firstMultiplier },
              { number: 50, multiplier: 1 }
            ]
          });
        }
      }
    }
  }
  
  // Three dart finishes (only show a few common high finishes, only if 3 darts remaining)
  if (dartsRemaining >= 3 && remainingScore <= 170 && remainingScore > 110) {
    // T20, T20, Bull (170)
    if (remainingScore === 170) {
      options.push({
        description: "T20→T20→Bull",
        throws: [
          { number: 20, multiplier: 3 },
          { number: 20, multiplier: 3 },
          { number: 50, multiplier: 1 }
        ]
      });
    }
    
    // T20, T19, D16 (167)
    if (remainingScore === 167) {
      options.push({
        description: "T20→T19→D16",
        throws: [
          { number: 20, multiplier: 3 },
          { number: 19, multiplier: 3 },
          { number: 16, multiplier: 2 }
        ]
      });
    }
    
    // T20, T20, D20 (160)
    if (remainingScore === 160) {
      options.push({
        description: "T20→T20→D20",
        throws: [
          { number: 20, multiplier: 3 },
          { number: 20, multiplier: 3 },
          { number: 20, multiplier: 2 }
        ]
      });
    }
  }
  
  // Remove duplicates and sort by number of throws
  const uniqueOptions = options.filter((option, index, self) => 
    index === self.findIndex(o => o.description === option.description)
  );
  
  return uniqueOptions.sort((a, b) => a.throws.length - b.throws.length).slice(0, 5);
};