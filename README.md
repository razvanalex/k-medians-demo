# K-Medians Clustering Demo

## 🎯 About

This educational tool demonstrates how the K-Medians algorithm works using a delivery depot scenario. You can:
- Drag houses and depots to different positions on the grid
- Step through the algorithm iteration by iteration
- See how assignments and relocations work in real-time
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

1. **Assign**: Each house is assigned to the nearest depot using Manhattan distance (L1 norm)
2. **Relocate**: Each depot moves to the median position of its assigned houses

The process repeats until depot positions stabilize (convergence).

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

