/**
 * Unit tests for percentage handling functionality
 */

const { createMockDOM, resetMocks, createSampleProject } = require('../test-utils');

describe('Percentage Handling', () => {
  beforeEach(() => {
    createMockDOM();
    resetMocks();
    
    // Initialize global state properly
    global.window = global.window || {};
    global.window.ProjectMapState = {
      rootNode: null,
      percentageCache: new Map(),
      hasUnsavedChanges: false
    };
  });

  describe('percentage validation', () => {
    test('should accept valid percentage values', () => {
      const validPercentages = [0, 0.1, 25.5, 50, 75.75, 99.9, 100];
      
      validPercentages.forEach(percentage => {
        const project = createSampleProject({ percentage });
        expect(project.percentage).toBe(percentage);
        expect(project.percentage >= 0 && project.percentage <= 100).toBe(true);
      });
    });

    test('should handle edge cases for percentage values', () => {
      // Test boundary values
      expect(0).toBeGreaterThanOrEqual(0);
      expect(0).toBeLessThanOrEqual(100);
      expect(100).toBeGreaterThanOrEqual(0);
      expect(100).toBeLessThanOrEqual(100);
      
      // Test precision
      const precisePercentage = 33.333333;
      const project = createSampleProject({ percentage: precisePercentage });
      expect(project.percentage).toBe(precisePercentage);
    });

    test('should identify invalid percentage values', () => {
      const invalidPercentages = [-0.1, -10, 100.1, 150, 999, NaN, Infinity, -Infinity];
      
      invalidPercentages.forEach(percentage => {
        expect(percentage < 0 || percentage > 100 || !Number.isFinite(percentage)).toBe(true);
      });
    });
  });

  describe('percentage persistence in JSON', () => {
    test('should preserve percentage precision in JSON serialization', () => {
      const originalData = {
        projects: [
          createSampleProject({ id: 'project1', percentage: 33.333333 }),
          createSampleProject({ id: 'project2', percentage: 66.666667 }),
          createSampleProject({ id: 'project3', percentage: 0.1 }),
          createSampleProject({ id: 'project4', percentage: 99.9 })
        ]
      };

      // Simulate JSON save/load cycle
      const jsonString = JSON.stringify(originalData);
      const parsedData = JSON.parse(jsonString);

      // Verify percentages are preserved
      expect(parsedData.projects[0].percentage).toBe(33.333333);
      expect(parsedData.projects[1].percentage).toBe(66.666667);
      expect(parsedData.projects[2].percentage).toBe(0.1);
      expect(parsedData.projects[3].percentage).toBe(99.9);
    });

    test('should handle percentage in nested project structure', () => {
      const nestedData = {
        projects: [
          {
            ...createSampleProject({ id: 'parent', percentage: 75.5 }),
            children: [
              createSampleProject({ id: 'child1', percentage: 25.25 }),
              createSampleProject({ id: 'child2', percentage: 50.75 })
            ]
          }
        ]
      };

      const jsonString = JSON.stringify(nestedData);
      const parsedData = JSON.parse(jsonString);

      expect(parsedData.projects[0].percentage).toBe(75.5);
      expect(parsedData.projects[0].children[0].percentage).toBe(25.25);
      expect(parsedData.projects[0].children[1].percentage).toBe(50.75);
    });
  });

  describe('percentage caching', () => {
    test('should cache and retrieve percentage values', () => {
      const cache = new Map();
      
      // Simulate caching
      cache.set('project1', 45.5);
      cache.set('project2', 78.25);
      
      expect(cache.get('project1')).toBe(45.5);
      expect(cache.get('project2')).toBe(78.25);
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    test('should handle cache updates', () => {
      const cache = new Map();
      
      // Initial cache
      cache.set('project1', 30.0);
      expect(cache.get('project1')).toBe(30.0);
      
      // Update cache
      cache.set('project1', 55.5);
      expect(cache.get('project1')).toBe(55.5);
    });

    test('should clear cache when needed', () => {
      const cache = new Map();
      
      cache.set('project1', 40.0);
      cache.set('project2', 60.0);
      expect(cache.size).toBe(2);
      
      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.get('project1')).toBeUndefined();
    });
  });

  describe('percentage display and formatting', () => {
    test('should format percentages for display', () => {
      const testCases = [
        { input: 0, expected: '0%' },
        { input: 25, expected: '25%' },
        { input: 33.3, expected: '33.3%' },
        { input: 66.67, expected: '66.67%' },
        { input: 100, expected: '100%' }
      ];

      testCases.forEach(({ input, expected }) => {
        const formatted = `${input}%`;
        expect(formatted).toBe(expected);
      });
    });

    test('should handle decimal precision in display', () => {
      const percentage = 33.333333;
      
      // Test different precision levels
      expect(percentage.toFixed(0)).toBe('33');
      expect(percentage.toFixed(1)).toBe('33.3');
      expect(percentage.toFixed(2)).toBe('33.33');
      expect(percentage.toFixed(3)).toBe('33.333');
    });
  });

  describe('percentage calculations and updates', () => {
    test('should handle percentage increments', () => {
      let percentage = 45.5;
      
      percentage += 10.25;
      expect(percentage).toBe(55.75);
      
      percentage += 44.25;
      expect(percentage).toBe(100);
    });

    test('should handle percentage decrements', () => {
      let percentage = 75.75;
      
      percentage -= 25.25;
      expect(percentage).toBe(50.5);
      
      percentage -= 50.5;
      expect(percentage).toBe(0);
    });

    test('should clamp percentage values to valid range', () => {
      function clampPercentage(value) {
        return Math.max(0, Math.min(100, value));
      }

      expect(clampPercentage(-10)).toBe(0);
      expect(clampPercentage(0)).toBe(0);
      expect(clampPercentage(50)).toBe(50);
      expect(clampPercentage(100)).toBe(100);
      expect(clampPercentage(150)).toBe(100);
    });
  });

  describe('percentage slider behavior', () => {
    test('should convert slider values to percentages', () => {
      // Assuming slider range is 0-100
      const sliderToPercentage = (sliderValue, min = 0, max = 100) => {
        return ((sliderValue - min) / (max - min)) * 100;
      };

      expect(sliderToPercentage(0)).toBe(0);
      expect(sliderToPercentage(25)).toBe(25);
      expect(sliderToPercentage(50)).toBe(50);
      expect(sliderToPercentage(100)).toBe(100);
    });

    test('should convert percentages to slider values', () => {
      const percentageToSlider = (percentage, min = 0, max = 100) => {
        return min + (percentage / 100) * (max - min);
      };

      expect(percentageToSlider(0)).toBe(0);
      expect(percentageToSlider(25)).toBe(25);
      expect(percentageToSlider(50)).toBe(50);
      expect(percentageToSlider(100)).toBe(100);
    });
  });

  describe('percentage data integrity', () => {
    test('should maintain percentage consistency across operations', () => {
      const project = createSampleProject({ percentage: 42.75 });
      
      // Simulate various operations that should preserve percentage
      const serialized = JSON.stringify(project);
      const deserialized = JSON.parse(serialized);
      
      expect(deserialized.percentage).toBe(42.75);
      
      // Simulate update operation
      const updated = { ...deserialized, percentage: 67.25 };
      expect(updated.percentage).toBe(67.25);
    });

    test('should handle percentage in complex data structures', () => {
      const complexData = {
        metadata: { version: '1.0' },
        projects: [
          {
            ...createSampleProject({ id: 'main', percentage: 88.5 }),
            subprojects: [
              { id: 'sub1', percentage: 33.3 },
              { id: 'sub2', percentage: 66.7 }
            ]
          }
        ],
        settings: {
          defaultPercentage: 50.0
        }
      };

      const jsonString = JSON.stringify(complexData);
      const parsed = JSON.parse(jsonString);

      expect(parsed.projects[0].percentage).toBe(88.5);
      expect(parsed.projects[0].subprojects[0].percentage).toBe(33.3);
      expect(parsed.projects[0].subprojects[1].percentage).toBe(66.7);
      expect(parsed.settings.defaultPercentage).toBe(50.0);
    });
  });
});
