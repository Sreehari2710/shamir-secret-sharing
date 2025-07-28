

class ShamirSecretSharing {
    
    /**
     * Convert a number from any base to decimal
     * @param {string} value - The value to convert
     * @param {number} base - The base of the input value (2-36)
     * @returns {number} The decimal representation
     */
    static baseToDecimal(value, base) {
        if (base < 2 || base > 36) {
            throw new Error(`Invalid base: ${base}. Base must be between 2 and 36.`);
        }
        
        const result = parseInt(value, base);
        if (isNaN(result)) {
            throw new Error(`Invalid value "${value}" for base ${base}`);
        }
        
        return result;
    }

    /**
     * Perform Lagrange interpolation to find the constant term (secret)
     * @param {Array<Array<number>>} points - Array of [x, y] coordinate pairs
     * @param {number} k - Number of points to use for interpolation
     * @returns {number} The constant term of the polynomial (the secret)
     */
    static lagrangeInterpolation(points, k) {
        if (points.length < k) {
            throw new Error(`Need at least ${k} points, but only ${points.length} provided`);
        }

        // Use only the first k points for interpolation
        const selectedPoints = points.slice(0, k);
        
        // Calculate the value at x = 0 (constant term)
        let secret = 0;
        
        for (let i = 0; i < selectedPoints.length; i++) {
            const [xi, yi] = selectedPoints[i];
            
            // Calculate Lagrange basis polynomial Li(0)
            let li = 1;
            for (let j = 0; j < selectedPoints.length; j++) {
                if (i !== j) {
                    const [xj, yj] = selectedPoints[j];
                    li *= (0 - xj) / (xi - xj);
                }
            }
            
            secret += yi * li;
        }
        
        return Math.round(secret);
    }

    /**
     * Validate the solution by checking if all points lie on the reconstructed polynomial
     * @param {Array<Array<number>>} points - All available points
     * @param {number} secret - The calculated secret
     * @param {number} k - Number of points used for reconstruction
     * @returns {Object} Validation result with details
     */
    static validateSolution(points, secret, k) {
        const selectedPoints = points.slice(0, k);
        const tolerance = 1e-10; // Tolerance for floating-point errors
        const validationResults = [];
        
        for (let testPoint of points) {
            const [testX, testY] = testPoint;
            
            // Calculate what Y should be at testX using Lagrange interpolation
            let calculatedY = 0;
            
            for (let i = 0; i < selectedPoints.length; i++) {
                const [xi, yi] = selectedPoints[i];
                
                // Calculate Lagrange basis polynomial Li(testX)
                let li = 1;
                for (let j = 0; j < selectedPoints.length; j++) {
                    if (i !== j) {
                        const [xj, yj] = selectedPoints[j];
                        li *= (testX - xj) / (xi - xj);
                    }
                }
                
                calculatedY += yi * li;
            }
            
            const difference = Math.abs(calculatedY - testY);
            const isValid = difference <= tolerance;
            
            validationResults.push({
                point: [testX, testY],
                calculated: calculatedY,
                difference: difference,
                valid: isValid
            });
        }
        
        const allValid = validationResults.every(result => result.valid);
        
        return {
            isValid: allValid,
            results: validationResults,
            tolerance: tolerance
        };
    }

    /**
     * Parse and decode points from JSON test case format
     * @param {Object} testCase - The JSON test case object
     * @returns {Array<Array<number>>} Array of decoded [x, y] points
     */
    static parseTestCase(testCase) {
        const { keys } = testCase;
        if (!keys || !keys.n || !keys.k) {
            throw new Error('Invalid test case format: missing keys.n or keys.k');
        }

        const n = keys.n;
        const k = keys.k;
        const points = [];
        
        for (let i = 1; i <= n; i++) {
            if (testCase[i.toString()]) {
                const x = i;
                const base = parseInt(testCase[i.toString()].base);
                const encodedValue = testCase[i.toString()].value;
                
                try {
                    const y = this.baseToDecimal(encodedValue, base);
                    points.push([x, y]);
                } catch (error) {
                    throw new Error(`Error decoding point ${i}: ${error.message}`);
                }
            }
        }
        
        if (points.length < k) {
            throw new Error(`Insufficient points: need ${k}, found ${points.length}`);
        }
        
        return { points, n, k };
    }

    /**
     * Complete solution for a Shamir's Secret Sharing test case
     * @param {Object} testCase - The JSON test case object
     * @returns {Object} Complete solution with secret and validation
     */
    static solve(testCase) {
        try {
            // Parse the test case
            const { points, n, k } = this.parseTestCase(testCase);
            
            // Find the secret using Lagrange interpolation
            const secret = this.lagrangeInterpolation(points, k);
            
            // Validate the solution
            const validation = this.validateSolution(points, secret, k);
            
            return {
                success: true,
                secret: secret,
                points: points,
                parameters: { n, k, degree: k - 1 },
                validation: validation,
                error: null
            };
            
        } catch (error) {
            return {
                success: false,
                secret: null,
                points: null,
                parameters: null,
                validation: null,
                error: error.message
            };
        }
    }

    /**
     * Solve multiple test cases
     * @param {Array<Object>} testCases - Array of test case objects
     * @returns {Array<Object>} Array of solution results
     */
    static solveMultiple(testCases) {
        return testCases.map((testCase, index) => {
            const result = this.solve(testCase);
            return {
                testCaseIndex: index,
                ...result
            };
        });
    }
}

// Example usage and test cases
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = ShamirSecretSharing;
} else {
    // Browser environment - make it globally available
    window.ShamirSecretSharing = ShamirSecretSharing;
}

// Example test case
const exampleTestCase1 = {
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": {
        "base": "10",
        "value": "4"
    },
    "2": {
        "base": "2",
        "value": "111"
    },
    "3": {
        "base": "10",
        "value": "12"
    },
    "6": {
        "base": "4",
        "value": "213"
    }
};

const exampleTestCase2 = {
    "keys": {
        "n": 10,
        "k": 7
    },
    "1": {
        "base": "6",
        "value": "13444211440455345511"
    },
    "2": {
        "base": "15",
        "value": "aed7015a346d63"
    },
    "3": {
        "base": "15",
        "value": "6aeeb69631c227c"
    },
    "4": {
        "base": "16",
        "value": "e1b5e05623d881f"
    },
    "5": {
        "base": "8",
        "value": "316034514573652620673"
    },
    "6": {
        "base": "3",
        "value": "2122212201122002221120200210011020220200"
    },
    "7": {
        "base": "3",
        "value": "20120221122211000100210021102001201112121"
    },
    "8": {
        "base": "6",
        "value": "20220554335330240002224253"
    },
    "9": {
        "base": "12",
        "value": "45153788322a1255483"
    },
    "10": {
        "base": "7",
        "value": "1101613130313526312514143"
    }
};

// Demo function to test the implementation
function runDemo() {
    console.log("=== Shamir's Secret Sharing Demo ===\n");
    
    // Test Case 1
    console.log("Test Case 1:");
    const result1 = ShamirSecretSharing.solve(exampleTestCase1);
    if (result1.success) {
        console.log(`Secret: ${result1.secret}`);
        console.log(`Validation: ${result1.validation.isValid ? 'PASSED' : 'FAILED'}`);
        console.log(`Parameters: n=${result1.parameters.n}, k=${result1.parameters.k}\n`);
    } else {
        console.log(`Error: ${result1.error}\n`);
    }
    
    // Test Case 2
    console.log("Test Case 2:");
    const result2 = ShamirSecretSharing.solve(exampleTestCase2);
    if (result2.success) {
        console.log(`Secret: ${result2.secret}`);
        console.log(`Validation: ${result2.validation.isValid ? 'PASSED' : 'FAILED'}`);
        console.log(`Parameters: n=${result2.parameters.n}, k=${result2.parameters.k}`);
    } else {
        console.log(`Error: ${result2.error}`);
    }
}

// Uncomment the next line to run demo in Node.js
// runDemo();