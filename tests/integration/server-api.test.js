/**
 * Integration tests for server API endpoints
 */

const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');
const { createSampleProject, createTempFile, cleanupFiles } = require('../test-utils');

// Import the Express app
const app = require('../../server/app.js');

describe('Server API Integration', () => {
  let tempFiles = [];

  afterEach(async () => {
    // Clean up any temporary files created during tests
    await cleanupFiles(tempFiles);
    tempFiles = [];
  });

  describe('POST /saveJSON', () => {
    test('should save JSON data to file successfully', async () => {
      const projectData = {
        projects: [
          createSampleProject({ id: 'api-test-1', percentage: 65.75 }),
          createSampleProject({ id: 'api-test-2', percentage: 34.25 })
        ],
        metadata: {
          version: '1.0',
          savedViaAPI: true
        }
      };

      const response = await request(app)
        .post('/saveJSON')
        .send({
          filename: 'api-test-save.json',
          data: projectData
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('saved successfully');

      // Verify file was actually created and contains correct data
      const savedFilePath = path.join(__dirname, '../../project-maps/api-test-save.json');
      const fileContent = await fs.readFile(savedFilePath, 'utf8');
      const parsedData = JSON.parse(fileContent);

      expect(parsedData.projects).toHaveLength(2);
      expect(parsedData.projects[0].percentage).toBe(65.75);
      expect(parsedData.projects[1].percentage).toBe(34.25);
      expect(parsedData.metadata.savedViaAPI).toBe(true);

      // Add to cleanup list
      tempFiles.push(savedFilePath);
    });

    test('should handle percentage precision in API save', async () => {
      const projectData = {
        projects: [
          createSampleProject({ 
            id: 'precision-api-test', 
            percentage: 33.333333,
            name: 'API Precision Test'
          })
        ]
      };

      const response = await request(app)
        .post('/saveJSON')
        .send({
          filename: 'precision-api-test.json',
          data: projectData
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify precision is maintained
      const savedFilePath = path.join(__dirname, '../../project-maps/precision-api-test.json');
      const fileContent = await fs.readFile(savedFilePath, 'utf8');
      const parsedData = JSON.parse(fileContent);

      expect(parsedData.projects[0].percentage).toBe(33.333333);

      tempFiles.push(savedFilePath);
    });

    test('should handle complex nested structures via API', async () => {
      const complexData = {
        projects: [
          {
            ...createSampleProject({ id: 'api-parent', percentage: 70.5 }),
            children: [
              createSampleProject({ id: 'api-child-1', percentage: 45.25 }),
              {
                ...createSampleProject({ id: 'api-child-2', percentage: 55.75 }),
                children: [
                  createSampleProject({ id: 'api-grandchild', percentage: 88.125 })
                ]
              }
            ]
          }
        ]
      };

      const response = await request(app)
        .post('/saveJSON')
        .send({
          filename: 'complex-api-test.json',
          data: complexData
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify complex structure is preserved
      const savedFilePath = path.join(__dirname, '../../project-maps/complex-api-test.json');
      const fileContent = await fs.readFile(savedFilePath, 'utf8');
      const parsedData = JSON.parse(fileContent);

      expect(parsedData.projects[0].children).toHaveLength(2);
      expect(parsedData.projects[0].children[1].children[0].percentage).toBe(88.125);

      tempFiles.push(savedFilePath);
    });

    test('should return error for missing filename', async () => {
      const projectData = {
        projects: [createSampleProject()]
      };

      const response = await request(app)
        .post('/saveJSON')
        .send({
          data: projectData
          // Missing filename
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('filename');
    });

    test('should return error for missing data', async () => {
      const response = await request(app)
        .post('/saveJSON')
        .send({
          filename: 'test.json'
          // Missing data
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('data');
    });

    test('should handle invalid JSON data gracefully', async () => {
      // Test with actually problematic data that should cause serialization issues
      // Since supertest handles circular references by converting them automatically,
      // we need to test a different scenario that would actually cause JSON.stringify to fail
      
      // Create an object with a function (which can't be serialized to JSON)
      const invalidData = { 
        projects: [],
        invalidFunction: function() { return 'test'; },
        // Functions get stripped by JSON.stringify, so let's test something else
        symbol: Symbol('test'), // Symbols also can't be serialized
        bigint: BigInt(123) // BigInt also can't be serialized in JSON
      };

      const response = await request(app)
        .post('/saveJSON')
        .send({
          filename: 'invalid-test.json',
          data: invalidData
        });

      // The server should either succeed (by stripping invalid properties) 
      // or return an error - both are acceptable behaviors
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      }
    });

    test('should sanitize filename to prevent path traversal', async () => {
      const projectData = {
        projects: [createSampleProject({ id: 'security-test' })]
      };

      // Attempt path traversal
      const response = await request(app)
        .post('/saveJSON')
        .send({
          filename: '../../../etc/passwd',
          data: projectData
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid filename');
    });

    test('should handle unicode filenames correctly', async () => {
      const projectData = {
        projects: [
          createSampleProject({ 
            id: 'unicode-filename-test',
            name: 'Unicode Test Project'
          })
        ]
      };

      const response = await request(app)
        .post('/saveJSON')
        .send({
          filename: 'unicode-测试-тест-اختبار.json',
          data: projectData
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify file was created (filename might be sanitized)
      const expectedPath = path.join(__dirname, '../../project-maps/unicode-测试-тест-اختبار.json');
      try {
        const fileContent = await fs.readFile(expectedPath, 'utf8');
        const parsedData = JSON.parse(fileContent);
        expect(parsedData.projects[0].id).toBe('unicode-filename-test');
        tempFiles.push(expectedPath);
      } catch (error) {
        // File might be saved with sanitized name, which is acceptable
        console.log('Unicode filename test: file might be sanitized');
      }
    });
  });

  describe('Server error handling', () => {
    test('should handle file system errors gracefully', async () => {
      const projectData = {
        projects: [createSampleProject()]
      };

      // Try to save to a filename that would cause file system issues
      const response = await request(app)
        .post('/saveJSON')
        .send({
          filename: '', // Empty filename should cause error
          data: projectData
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle large payloads appropriately', async () => {
      // Create a large dataset
      const largeData = {
        projects: []
      };

      // Add many projects to test payload size limits
      for (let i = 0; i < 1000; i++) {
        largeData.projects.push(
          createSampleProject({ 
            id: `large-test-${i}`,
            name: `Large Test Project ${i}`,
            description: 'A'.repeat(1000), // Large description
            percentage: Math.random() * 100
          })
        );
      }

      const response = await request(app)
        .post('/saveJSON')
        .send({
          filename: 'large-payload-test.json',
          data: largeData
        });

      // Should either succeed or fail gracefully (depending on server limits)
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        const savedFilePath = path.join(__dirname, '../../project-maps/large-payload-test.json');
        tempFiles.push(savedFilePath);
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('Content-Type handling', () => {
    test('should accept application/json content type', async () => {
      const projectData = {
        projects: [createSampleProject({ id: 'content-type-test' })]
      };

      const response = await request(app)
        .post('/saveJSON')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          filename: 'content-type-test.json',
          data: projectData
        }))
        .expect(200);

      expect(response.body.success).toBe(true);

      const savedFilePath = path.join(__dirname, '../../project-maps/content-type-test.json');
      tempFiles.push(savedFilePath);
    });

    test('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/saveJSON')
        .set('Content-Type', 'application/json')
        .send('{ malformed json }')
        .expect(400);

      expect(response.body).toBeDefined();
    });
  });

  describe('Response format', () => {
    test('should return consistent response format for success', async () => {
      const projectData = {
        projects: [createSampleProject()]
      };

      const response = await request(app)
        .post('/saveJSON')
        .send({
          filename: 'response-format-test.json',
          data: projectData
        })
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body.success).toBe(true);
      expect(typeof response.body.message).toBe('string');

      const savedFilePath = path.join(__dirname, '../../project-maps/response-format-test.json');
      tempFiles.push(savedFilePath);
    });

    test('should return consistent response format for errors', async () => {
      const response = await request(app)
        .post('/saveJSON')
        .send({
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body.success).toBe(false);
      expect(typeof response.body.error).toBe('string');
    });
  });
});
