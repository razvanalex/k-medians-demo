def manhattan_distance(p1, p2):
    return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])


# The exact coordinates of our 7 houses
houses = [(2, 3), (4, 4), (0, 6), (1, 1), (3, 1), (2, 0), (3, 7)]

# Generate all possible coordinates on the 5x8 grid
grid_points = []
for x in range(5):
    for y in range(8):
        grid_points.append((x, y))

best_distance = float("inf")
best_depot_pairs = []

# Brute-force every possible combination of Depot A and Depot B
for i in range(len(grid_points)):
    for j in range(
        i, len(grid_points)
    ):  # Start at i to avoid checking reversed pairs twice
        depot_A = grid_points[i]
        depot_B = grid_points[j]

        current_total_distance = 0

        # Calculate distance from each house to its closest depot
        for house in houses:
            dist_to_A = manhattan_distance(house, depot_A)
            dist_to_B = manhattan_distance(house, depot_B)
            current_total_distance += min(dist_to_A, dist_to_B)

        # Update the best score if we found a lower one
        if current_total_distance < best_distance:
            best_distance = current_total_distance
            best_depot_pairs = [(depot_A, depot_B)]
        # Keep track if there are ties for the absolute best score
        elif current_total_distance == best_distance:
            best_depot_pairs.append((depot_A, depot_B))

print(f"The absolute minimum total distance is: {best_distance}")
print("The depot pairs that achieve this score are:")
for pair in best_depot_pairs:
    print(f"Depots at {pair[0]} and {pair[1]}")
