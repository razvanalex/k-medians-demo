# K-Medians Clustering Demo

## 🎯 About

This educational tool demonstrates how the K-Medians clustering algorithm works. You can:
- Drag data points and centroids to different positions on the grid
- Step through the algorithm iteration by iteration
- See how cluster assignments and centroid relocations work in real-time
- Understand Manhattan distance and median calculations

## 🚀 Live Demo

Visit the live demo at: **https://razvanalex.github.io/k-medians-demo/**

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📚 Algorithm

The K-Medians algorithm uses two alternating steps:

1. **Assign**: Each data point is assigned to the nearest centroid using Manhattan distance (L1 norm)
2. **Update**: Each centroid moves to the median position of its assigned points

The process repeats until centroid positions stabilize (convergence).

### Learn More

- [K-medians clustering on Wikipedia](https://en.wikipedia.org/wiki/K-medians_clustering)
- [K-means clustering on Wikipedia](https://en.wikipedia.org/wiki/K-means_clustering)
- [Taxicab geometry (Manhattan distance) on Wikipedia](https://en.wikipedia.org/wiki/Taxicab_geometry)
- [Median on Wikipedia](https://en.wikipedia.org/wiki/Median)

## 🏗️ Built With

- React 18
- Vite
- Tailwind CSS
- Lucide Icons

## 📝 License

MIT License

