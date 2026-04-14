import express from 'express';
const router = express.Router();

// Mock Course Data
const courses = [
  {
    id: 'soil-health-101',
    title: 'Soil Health 101',
    description: 'Learn the basics of soil management and health.',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800',
    modules: [
      {
        id: 'm1',
        title: 'Introduction to Soil',
        lessons: [
          { id: 'l1', title: 'What is Soil?', type: 'text', content: 'Soil is the foundation of agriculture...' },
          { id: 'l2', title: 'Soil Components', type: 'video', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
        ]
      },
      {
        id: 'm2',
        title: 'Nutrient Management',
        lessons: [
          { id: 'l3', title: 'NPK Basics', type: 'text', content: 'Nitrogen, Phosphorus, and Potassium are vital...' }
        ]
      }
    ]
  },
  {
    id: 'pest-control-adv',
    title: 'Advanced Pest Control',
    description: 'Master integrated pest management techniques.',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800',
    modules: [
      {
        id: 'm1',
        title: 'Identifying Pests',
        lessons: [
          { id: 'l1', title: 'Common Insects', type: 'text', content: 'Identify harmful vs beneficial insects...' }
        ]
      }
    ]
  }
];

// Get all courses (metadata only)
router.get('/', (req, res) => {
  const metadata = courses.map(({ modules, ...rest }) => rest);
  res.json(metadata);
});

// Get full course details
router.get('/:id', (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  if (course) {
    res.json(course);
  } else {
    res.status(404).json({ error: 'Course not found' });
  }
});

// Sync progress (mock)
router.post('/sync-progress', (req, res) => {
  const { progress } = req.body;
  console.log('Syncing progress to backend:', progress);
  res.json({ success: true, syncedAt: new Date().toISOString() });
});

export default router;
