/**
 * Unit tests for ProjectMapDataManager
 */

const path = require('path');
const { createMockDOM, resetMocks, createSampleProject, isValidProject, loadFixture } = require('../test-utils');

// Mock ProjectMapConfig before importing the data manager
global.ProjectMapConfig = {
  defaults: {
    newNodePercentage: 50
  },
  storage: {
    projectMapRoot: 'projectMapRoot'
  }
};

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Import the module under test
const ProjectMapDataManager = require('../../js/project-map/data-manager.js');

describe('ProjectMapDataManager', () => {
  beforeEach(() => {
    createMockDOM();
    resetMocks();
    
    // Initialize global state properly
    global.window = global.window || {};
    global.window.ProjectMapState = {
      rootNode: null,
      selectedNode: null,
      draggedNode: null,
      percentageCache: new Map(),
      hasUnsavedChanges: false
    };
  });

  describe('findNodeById', () => {
    test('should find node at root level', () => {
      const rootNode = {
        id: 'root',
        name: 'Root Project',
        children: []
      };

      const result = ProjectMapDataManager.findNodeById(rootNode, 'root');
      expect(result).toBe(rootNode);
    });

    test('should find node in nested structure', () => {
      const childNode = { id: 'child', name: 'Child Project' };
      const rootNode = {
        id: 'root',
        name: 'Root Project',
        children: [
          {
            id: 'parent',
            name: 'Parent Project',
            children: [childNode]
          }
        ]
      };

      const result = ProjectMapDataManager.findNodeById(rootNode, 'child');
      expect(result).toBe(childNode);
    });

    test('should return null for non-existent node', () => {
      const rootNode = {
        id: 'root',
        name: 'Root Project',
        children: []
      };

      const result = ProjectMapDataManager.findNodeById(rootNode, 'nonexistent');
      expect(result).toBeNull();
    });

    test('should handle nodes without children', () => {
      const leafNode = { id: 'leaf', name: 'Leaf Project' };
      
      const result = ProjectMapDataManager.findNodeById(leafNode, 'leaf');
      expect(result).toBe(leafNode);
    });
  });

  describe('findParentAndIndex', () => {
    test('should find direct child parent and index', () => {
      const child1 = { id: 'child1', name: 'Child 1' };
      const child2 = { id: 'child2', name: 'Child 2' };
      const rootNode = {
        id: 'root',
        name: 'Root Project',
        children: [child1, child2]
      };

      const result = ProjectMapDataManager.findParentAndIndex(rootNode, 'child2');
      expect(result).toEqual({
        parent: rootNode,
        index: 1
      });
    });

    test('should find nested child parent and index', () => {
      const grandchild = { id: 'grandchild', name: 'Grandchild' };
      const child = {
        id: 'child',
        name: 'Child',
        children: [grandchild]
      };
      const rootNode = {
        id: 'root',
        name: 'Root Project',
        children: [child]
      };

      const result = ProjectMapDataManager.findParentAndIndex(rootNode, 'grandchild');
      expect(result).toEqual({
        parent: child,
        index: 0
      });
    });

    test('should return null for root node', () => {
      const rootNode = {
        id: 'root',
        name: 'Root Project',
        children: []
      };

      const result = ProjectMapDataManager.findParentAndIndex(rootNode, 'root');
      expect(result).toBeNull();
    });

    test('should return null for non-existent node', () => {
      const rootNode = {
        id: 'root',
        name: 'Root Project',
        children: []
      };

      const result = ProjectMapDataManager.findParentAndIndex(rootNode, 'nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('addChildNode', () => {
    test('should add child node to parent', () => {
      const parentNode = {
        id: 'parent',
        name: 'Parent Project',
        children: []
      };

      const newNode = ProjectMapDataManager.addChildNode(parentNode, 'New Child');

      expect(parentNode.children).toHaveLength(1);
      expect(parentNode.children[0]).toBe(newNode);
      expect(newNode.label).toBe('New Child');
      expect(newNode.labelEN).toBe('New Child');
      expect(typeof newNode.id).toBe('number');
    });

    test('should create children array if it does not exist', () => {
      const parentNode = {
        id: 'parent',
        name: 'Parent Project'
        // No children array
      };

      const newNode = ProjectMapDataManager.addChildNode(parentNode, 'New Child');

      expect(parentNode.children).toBeDefined();
      expect(parentNode.children).toHaveLength(1);
      expect(parentNode.children[0]).toBe(newNode);
    });
  });

  describe('deleteNode', () => {
    test('should delete node from tree structure', () => {
      const nodeToRemove = { id: 'remove-me', name: 'Remove Me', children: [] };
      const siblingNode = { id: 'sibling', name: 'Sibling', children: [] };
      const rootNode = {
        id: 'root',
        name: 'Root Project',
        children: [nodeToRemove, siblingNode]
      };

      const result = ProjectMapDataManager.deleteNode(rootNode, 'remove-me');

      expect(result).toBe(true);
      expect(rootNode.children).toHaveLength(1);
      expect(rootNode.children[0]).toBe(siblingNode);
    });

    test('should delete node and move its children to parent', () => {
      const grandchild = { id: 'grandchild', name: 'Grandchild', children: [] };
      const nodeToRemove = {
        id: 'remove-me',
        name: 'Remove Me',
        children: [grandchild]
      };
      const rootNode = {
        id: 'root',
        name: 'Root Project',
        children: [nodeToRemove]
      };

      const result = ProjectMapDataManager.deleteNode(rootNode, 'remove-me');

      expect(result).toBe(true);
      expect(rootNode.children).toHaveLength(1);
      expect(rootNode.children[0]).toBe(grandchild);
    });

    test('should return false for non-existent node', () => {
      const rootNode = {
        id: 'root',
        name: 'Root Project',
        children: []
      };

      const result = ProjectMapDataManager.deleteNode(rootNode, 'nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('updateNodeLabels', () => {
    test('should update node labels', () => {
      const nodeToUpdate = {
        id: 'update-me',
        label: 'Old Label',
        labelEN: 'Old Label EN'
      };

      ProjectMapDataManager.updateNodeLabels(nodeToUpdate, 'New Label EN', 'New Label ZH');

      expect(nodeToUpdate.label).toBe('New Label EN');
      expect(nodeToUpdate.labelEN).toBe('New Label EN');
      expect(nodeToUpdate.labelZH).toBe('New Label ZH');
    });

    test('should handle partial updates (English only)', () => {
      const nodeToUpdate = {
        id: 'update-me',
        label: 'Old Label',
        labelEN: 'Old Label EN'
      };

      ProjectMapDataManager.updateNodeLabels(nodeToUpdate, 'New Label EN');

      expect(nodeToUpdate.labelEN).toBe('New Label EN');
      expect(nodeToUpdate.label).toBe('New Label EN');
      expect(nodeToUpdate.labelZH).toBeUndefined();
    });
  });

  describe('updateNodePercentage', () => {
    test('should update valid percentage', () => {
      const node = { id: 'test', percentage: 50 };
      
      const result = ProjectMapDataManager.updateNodePercentage(node, 75.5);
      
      expect(result).toBe(true);
      expect(node.percentage).toBe(75.5);
    });

    test('should reject invalid percentage values', () => {
      const node = { id: 'test', percentage: 50 };
      
      expect(ProjectMapDataManager.updateNodePercentage(node, -10)).toBe(false);
      expect(ProjectMapDataManager.updateNodePercentage(node, 150)).toBe(false);
      expect(node.percentage).toBe(50); // Should remain unchanged
    });

    test('should accept boundary values', () => {
      const node = { id: 'test', percentage: 50 };
      
      expect(ProjectMapDataManager.updateNodePercentage(node, 0)).toBe(true);
      expect(node.percentage).toBe(0);
      
      expect(ProjectMapDataManager.updateNodePercentage(node, 100)).toBe(true);
      expect(node.percentage).toBe(100);
    });
  });

  describe('data validation and project name handling', () => {
    test('should validate project map data', () => {
      const validData = {
        id: 0,
        label: 'Root',
        children: []
      };
      
      expect(ProjectMapDataManager.validateProjectMapData(validData)).toBe(true);
      
      const invalidData = {
        invalidStructure: true
      };
      
      expect(ProjectMapDataManager.validateProjectMapData(invalidData)).toBe(false);
    });

    test('should get project name with proper precedence', () => {
      const projectMap = {
        "project-name": "From JSON",
        label: "Root Label"
      };
      
      const name1 = ProjectMapDataManager.getProjectName(projectMap, "From URL");
      expect(name1).toBe("From JSON"); // JSON takes precedence
      
      const projectMapNoName = {
        label: "Root Label"
      };
      
      const name2 = ProjectMapDataManager.getProjectName(projectMapNoName, "From URL");
      expect(name2).toBe("From URL"); // URL fallback
    });

    test('should set project name', () => {
      const projectMap = {
        id: 0,
        label: "Root"
      };
      
      ProjectMapDataManager.setProjectName(projectMap, "New Project Name");
      
      expect(projectMap["project-name"]).toBe("New Project Name");
    });
  });

  describe('tree traversal utilities', () => {
    test('should walk nodes with callback', () => {
      const rootNode = {
        id: 'root',
        children: [
          {
            id: 'child1',
            children: [
              { id: 'grandchild1' }
            ]
          },
          { id: 'child2' }
        ]
      };

      const visitedNodes = [];
      const visitedDepths = [];
      
      ProjectMapDataManager.walkNodes(rootNode, (node, depth) => {
        visitedNodes.push(node.id);
        visitedDepths.push(depth);
      });

      expect(visitedNodes).toEqual(['root', 'child1', 'grandchild1', 'child2']);
      expect(visitedDepths).toEqual([0, 1, 2, 1]);
    });

    test('should deep copy project map', () => {
      const original = {
        id: 'root',
        label: 'Original',
        percentage: 50,
        children: [
          { id: 'child', label: 'Child', percentage: 25 }
        ]
      };

      const copy = ProjectMapDataManager.deepCopy(original);

      expect(copy).toEqual(original);
      expect(copy).not.toBe(original); // Different object reference
      expect(copy.children[0]).not.toBe(original.children[0]); // Deep copy
      
      // Modify copy to ensure independence
      copy.label = 'Modified';
      expect(original.label).toBe('Original');
    });
  });
});
