/**
 * Test script for Qoder validation functionality
 */

import { validateQoderRule, validateQoderRulesDirectory, generateValidationReport } from "../src/utils/qoder-validation.js";

async function testValidation() {
  console.log("🧪 Testing Qoder Validation Functions\n");

  // Test 1: Validate a single rule file
  console.log("Test 1: Validate requirements-spec.md");
  const result1 = await validateQoderRule(".qoder/rules/requirements-spec.md");
  console.log("Valid:", result1.valid);
  console.log("Errors:", result1.errors);
  console.log("Warnings:", result1.warnings);
  console.log("Frontmatter:", result1.frontmatter);
  console.log("");

  // Test 2: Validate core.md
  console.log("Test 2: Validate core.md");
  const result2 = await validateQoderRule(".qoder/rules/core.md");
  console.log("Valid:", result2.valid);
  console.log("Errors:", result2.errors);
  console.log("Warnings:", result2.warnings);
  console.log("");

  // Test 3: Validate entire directory
  console.log("Test 3: Validate entire .qoder/rules directory");
  const dirResults = await validateQoderRulesDirectory(".qoder/rules");
  console.log(`Total files validated: ${dirResults.size}`);
  
  // Generate report
  const report = generateValidationReport(dirResults);
  console.log(report);
}

testValidation().catch(console.error);
