#!/usr/bin/env node

// Using TypeScript with CommonJS module for scripts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Define the OpenAPI URL and output file path
const OPENAPI_URL = 'https://api-notes.vinod.digital/openapi.json';
const OUTPUT_FILE = path.resolve(process.cwd(), './src/types/generated/api.ts');
const OUTPUT_DIR = path.dirname(OUTPUT_FILE);

// Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

try {
  console.log(`Generating TypeScript definitions from ${OPENAPI_URL}...`);
  
  // Execute openapi-typescript to generate TypeScript definitions
  const command = `npx openapi-typescript ${OPENAPI_URL} --output ${OUTPUT_FILE}`;
  execSync(command, { stdio: 'inherit' });
  
  console.log(`TypeScript definitions generated successfully at ${OUTPUT_FILE}`);
} catch (error) {
  console.error('Error generating API types:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
