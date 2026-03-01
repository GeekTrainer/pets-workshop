import http from 'node:http';

export const MOCK_PORT = 5199;

export const mockDogs = [
  { id: 1, name: 'Buddy', breed: 'Golden Retriever' },
  { id: 2, name: 'Luna', breed: 'Husky' },
  { id: 3, name: 'Max', breed: 'German Shepherd' },
];

export const mockDogDetails: Record<number, object> = {
  1: {
    id: 1,
    name: 'Buddy',
    breed: 'Golden Retriever',
    age: 3,
    description: 'A friendly and loyal companion who loves to play fetch.',
    gender: 'Male',
    status: 'AVAILABLE',
  },
  2: {
    id: 2,
    name: 'Luna',
    breed: 'Husky',
    age: 2,
    description: 'An energetic and playful dog who loves the outdoors.',
    gender: 'Female',
    status: 'PENDING',
  },
  3: {
    id: 3,
    name: 'Max',
    breed: 'German Shepherd',
    age: 5,
    description: 'A loyal and protective dog, great with families.',
    gender: 'Male',
    status: 'ADOPTED',
  },
};

function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  const url = req.url || '';

  // GET /api/dogs
  if (url === '/api/dogs' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(mockDogs));
    return;
  }

  // GET /api/dogs/:id
  const dogMatch = url.match(/^\/api\/dogs\/(\d+)$/);
  if (dogMatch && req.method === 'GET') {
    const id = parseInt(dogMatch[1], 10);
    const dog = mockDogDetails[id];
    if (dog) {
      res.writeHead(200);
      res.end(JSON.stringify(dog));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Dog not found' }));
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

const server = http.createServer(handleRequest);

server.listen(MOCK_PORT, () => {
  console.log(`Mock API server running on http://localhost:${MOCK_PORT}`);
});
