/**
 * Integration tests for file operations (save/load JSON)
 */

const fs = require('fs').promises;
const path = require('path');
const { createTempFile, cleanupFiles, loadFixture, createSampleProject } = require('../test-utils');

describe('File Operations Integration', () => {
  let tempFiles = [];

  afterEach(async () => {
    // Clean up any temporary files created during tests
    await cleanupFiles(tempFiles);
    tempFiles = [];
  });

  describe('JSON file save operations', () => {
    test('should save project data to JSON file', async () => {
      const projectData = {
        projects: [
          createSampleProject({ id: 'project1', percentage: 45.5 }),
          createSampleProject({ id: 'project2', percentage: 78.25 })
        ],
        metadata: {
          version: '1.0',
          created: new Date().toISOString()
        }
      };

      const filePath = await createTempFile('test-save.json', projectData);
      tempFiles.push(filePath);

      // Verify file was created and contains correct data
      const fileContent = await fs.readFile(filePath, 'utf8');
      const parsedData = JSON.parse(fileContent);

      expect(parsedData.projects).toHaveLength(2);
      expect(parsedData.projects[0].percentage).toBe(45.5);
      expect(parsedData.projects[1].percentage).toBe(78.25);
      expect(parsedData.metadata.version).toBe('1.0');
    });

    test('should preserve percentage precision when saving', async () => {
      const projectData = {
        projects: [
          createSampleProject({ 
            id: 'precision-test', 
            percentage: 33.333333,
            name: 'Precision Test Project'
          })
        ]
      };

      const filePath = await createTempFile('precision-test.json', projectData);
      tempFiles.push(filePath);

      // Read back and verify precision is maintained
      const fileContent = await fs.readFile(filePath, 'utf8');
      const parsedData = JSON.parse(fileContent);

      expect(parsedData.projects[0].percentage).toBe(33.333333);
    });

    test('should handle complex nested project structures', async () => {
      const complexData = {
        projects: [
          {
            ...createSampleProject({ id: 'parent1', percentage: 60.5 }),
            children: [
              createSampleProject({ id: 'child1-1', percentage: 25.25 }),
              {
                ...createSampleProject({ id: 'child1-2', percentage: 35.75 }),
                children: [
                  createSampleProject({ id: 'grandchild1-2-1', percentage: 88.88 })
                ]
              }
            ]
          },
          createSampleProject({ id: 'parent2', percentage: 92.1 })
        ]
      };

      const filePath = await createTempFile('complex-structure.json', complexData);
      tempFiles.push(filePath);

      const fileContent = await fs.readFile(filePath, 'utf8');
      const parsedData = JSON.parse(fileContent);

      // Verify structure is preserved
      expect(parsedData.projects).toHaveLength(2);
      expect(parsedData.projects[0].children).toHaveLength(2);
      expect(parsedData.projects[0].children[1].children).toHaveLength(1);
      expect(parsedData.projects[0].children[1].children[0].percentage).toBe(88.88);
    });
  });

  describe('JSON file load operations', () => {
    test('should load project data from JSON file', async () => {
      const sampleData = await loadFixture('sample-project-map.json');

      expect(sampleData.projects).toHaveLength(3);
      expect(sampleData.projects[0].percentage).toBe(75.5);
      expect(sampleData.projects[1].percentage).toBe(42.3);
      expect(sampleData.projects[2].percentage).toBe(88.9);
    });

    test('should handle loading file with decimal percentages', async () => {
      const sampleData = await loadFixture('sample-project-map.json');
      
      // Verify all percentages are properly loaded as numbers
      sampleData.projects.forEach(project => {
        expect(typeof project.percentage).toBe('number');
        expect(project.percentage >= 0 && project.percentage <= 100).toBe(true);
      });
    });

    test('should validate loaded data structure', async () => {
      const sampleData = await loadFixture('sample-project-map.json');

      // Validate each project has required fields
      sampleData.projects.forEach(project => {
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('name');
        expect(project).toHaveProperty('x');
        expect(project).toHaveProperty('y');
        expect(project).toHaveProperty('percentage');
        expect(typeof project.id).toBe('string');
        expect(typeof project.name).toBe('string');
        expect(typeof project.x).toBe('number');
        expect(typeof project.y).toBe('number');
        expect(typeof project.percentage).toBe('number');
      });
    });
  });

  describe('JSON save/load round-trip', () => {
    test('should maintain data integrity in save/load cycle', async () => {
      const originalData = {
        projects: [
          createSampleProject({ 
            id: 'roundtrip1',
            name: 'Round Trip Test 1', 
            percentage: 67.789,
            x: 150.5,
            y: 275.25
          }),
          createSampleProject({ 
            id: 'roundtrip2',
            name: 'Round Trip Test 2', 
            percentage: 12.345,
            x: 300.75,
            y: 400.125
          })
        ],
        metadata: {
          version: '1.0',
          testFlag: true,
          numericValue: 42.42
        }
      };

      // Save to temp file
      const filePath = await createTempFile('roundtrip-test.json', originalData);
      tempFiles.push(filePath);

      // Load back from file
      const fileContent = await fs.readFile(filePath, 'utf8');
      const loadedData = JSON.parse(fileContent);

      // Verify all data matches exactly
      expect(loadedData).toEqual(originalData);
      expect(loadedData.projects[0].percentage).toBe(67.789);
      expect(loadedData.projects[1].percentage).toBe(12.345);
      expect(loadedData.projects[0].x).toBe(150.5);
      expect(loadedData.projects[0].y).toBe(275.25);
    });

    test('should handle multiple save/load cycles', async () => {
      let data = {
        projects: [
          createSampleProject({ id: 'cycle-test', percentage: 55.555 })
        ],
        cycleCount: 0
      };

      let filePath;

      // Perform multiple save/load cycles
      for (let i = 0; i < 5; i++) {
        data.cycleCount = i + 1;
        data.projects[0].percentage += 1.111; // Increment percentage each cycle

        filePath = await createTempFile(`cycle-test-${i}.json`, data);
        tempFiles.push(filePath);

        const fileContent = await fs.readFile(filePath, 'utf8');
        data = JSON.parse(fileContent);
      }

      // Verify final state
      expect(data.cycleCount).toBe(5);
      expect(data.projects[0].percentage).toBeCloseTo(55.555 + (5 * 1.111), 3);
    });
  });

  describe('error handling', () => {
    test('should handle invalid JSON gracefully', async () => {
      const invalidJsonPath = await createTempFile('invalid.json', '{ invalid json content');
      tempFiles.push(invalidJsonPath);

      // Attempt to read invalid JSON
      try {
        const fileContent = await fs.readFile(invalidJsonPath, 'utf8');
        JSON.parse(fileContent);
        fail('Should have thrown an error for invalid JSON');
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });

    test('should handle missing files gracefully', async () => {
      const nonExistentPath = path.join(__dirname, 'nonexistent.json');

      try {
        await fs.readFile(nonExistentPath, 'utf8');
        fail('Should have thrown an error for missing file');
      } catch (error) {
        expect(error.code).toBe('ENOENT');
      }
    });

    test('should validate data structure after loading', async () => {
      const invalidData = await loadFixture('invalid-project-map.json');

      // Validate that we can detect invalid structure
      const project = invalidData.projects[0];
      const isValid = (
        typeof project.id === 'string' &&
        typeof project.name === 'string' &&
        typeof project.x === 'number' &&
        typeof project.y === 'number' &&
        typeof project.percentage === 'number' &&
        project.percentage >= 0 &&
        project.percentage <= 100 &&
        Array.isArray(project.connections)
      );

      expect(isValid).toBe(false); // Should be invalid due to fixture content
    });
  });

  describe('file path handling', () => {
    test('should handle different file paths correctly', async () => {
      const testData = { test: 'data', percentage: 50.0 };
      
      // Test different path formats
      const paths = [
        'simple-filename.json',
        'subdirectory/nested-file.json',
        'deep/nested/path/file.json'
      ];

      for (const pathName of paths) {
        const filePath = await createTempFile(pathName, testData);
        tempFiles.push(filePath);

        const fileContent = await fs.readFile(filePath, 'utf8');
        const parsedData = JSON.parse(fileContent);

        expect(parsedData.percentage).toBe(50.0);
      }
    });

    test('should preserve file encoding (UTF-8)', async () => {
      const unicodeData = {
        projects: [
          createSampleProject({ 
            id: 'unicode-test',
            name: '测试项目 - тест - اختبار',
            description: 'Unicode characters: 🚀 ⭐ 🎯',
            percentage: 75.0
          })
        ]
      };

      const filePath = await createTempFile('unicode-test.json', unicodeData);
      tempFiles.push(filePath);

      const fileContent = await fs.readFile(filePath, 'utf8');
      const parsedData = JSON.parse(fileContent);

      expect(parsedData.projects[0].name).toBe('测试项目 - тест - اختبار');
      expect(parsedData.projects[0].description).toBe('Unicode characters: 🚀 ⭐ 🎯');
      expect(parsedData.projects[0].percentage).toBe(75.0);
    });
  });
});
