import type { Issue, IHighlight } from '../types/index';
import { v4 as uuidv4 } from 'uuid';

export const mockHighlights: IHighlight[] = [
  {
    id: uuidv4(),
    content: {
      text: "financial statements",
    },
    position: {
      boundingRect: {
        x1: 255.734,
        y1: 146.667,
        x2: 373.367,
        y2: 165.667,
        width: 810,
        height: 1200,
      },
      rects: [
        {
          x1: 255.734,
          y1: 146.667,
          x2: 373.367,
          y2: 165.667,
          width: 810,
          height: 1200,
        },
      ],
      pageNumber: 1,
    },
    comment: {
      text: "Verify the accuracy of these financial statements with Q4 data",
      emoji: "📊",
    },
  },
  {
    id: uuidv4(),
    content: {
      text: "revenue recognition policy",
    },
    position: {
      boundingRect: {
        x1: 100,
        y1: 200,
        x2: 350,
        y2: 220,
        width: 810,
        height: 1200,
      },
      rects: [
        {
          x1: 100,
          y1: 200,
          x2: 350,
          y2: 220,
          width: 810,
          height: 1200,
        },
      ],
      pageNumber: 2,
    },
    comment: {
      text: "Review compliance with new accounting standards",
      emoji: "⚠️",
    },
  },
  {
    id: uuidv4(),
    content: {
      text: "audit findings",
    },
    position: {
      boundingRect: {
        x1: 150,
        y1: 300,
        x2: 280,
        y2: 320,
        width: 810,
        height: 1200,
      },
      rects: [
        {
          x1: 150,
          y1: 300,
          x2: 280,
          y2: 320,
          width: 810,
          height: 1200,
        },
      ],
      pageNumber: 3,
    },
    comment: {
      text: "Material weakness identified - needs immediate attention",
      emoji: "🔴",
    },
  },
];

export const mockIssues: Issue[] = [
  {
    id: "ISSUE-001",
    page: 1,
    description: "Financial statements require verification with Q4 data",
    highlight: mockHighlights[0],
    status: "open",
    priority: "high",
    category: "Financial Review",
  },
  {
    id: "ISSUE-002",
    page: 2,
    description: "Revenue recognition policy needs compliance review",
    highlight: mockHighlights[1],
    status: "in-review",
    priority: "medium",
    category: "Compliance",
  },
  {
    id: "ISSUE-003",
    page: 3,
    description: "Material weakness in internal controls",
    highlight: mockHighlights[2],
    status: "open",
    priority: "high",
    category: "Audit Findings",
  },
  {
    id: "ISSUE-004",
    page: 4,
    description: "Missing disclosure note for contingent liabilities",
    highlight: undefined,
    status: "open",
    priority: "medium",
    category: "Disclosure",
  },
  {
    id: "ISSUE-005",
    page: 5,
    description: "Inventory valuation method documentation incomplete",
    highlight: undefined,
    status: "resolved",
    priority: "low",
    category: "Documentation",
  },
  {
    id: "ISSUE-006",
    page: 2,
    description: "Tax provision calculation needs review",
    highlight: undefined,
    status: "in-review",
    priority: "high",
    category: "Tax",
  },
  {
    id: "ISSUE-007",
    page: 6,
    description: "Related party transactions disclosure",
    highlight: undefined,
    status: "open",
    priority: "medium",
    category: "Disclosure",
  },
  {
    id: "ISSUE-008",
    page: 1,
    description: "Cash flow statement classification error",
    highlight: undefined,
    status: "resolved",
    priority: "high",
    category: "Financial Review",
  },
];