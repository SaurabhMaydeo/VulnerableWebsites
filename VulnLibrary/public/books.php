<?php
require_once '../src/config/database.php';
include '../templates/header.php';

$search = isset($_GET['search']) ? $_GET['search'] : '';
$category = isset($_GET['category']) ? $_GET['category'] : '';

// Vulnerable to SQL injection (intentionally)
$sql = "SELECT b.*, c.name as category_name 
        FROM books b 
        LEFT JOIN categories c ON b.category_id = c.id";

if ($search || $category) {
    $sql .= " WHERE ";
    $conditions = [];
    
    if ($search) {
        $conditions[] = "(b.title LIKE '%$search%' OR b.author LIKE '%$search%' OR b.description LIKE '%$search%')";
    }
    
    if ($category) {
        $conditions[] = "b.category_id = $category";
    }
    
    $sql .= implode(' AND ', $conditions);
}

$sql .= " ORDER BY b.title ASC";
$books = query($sql);

// Get all categories for filter
$categories = query("SELECT * FROM categories ORDER BY name");
?>

<div class="container mt-4">
    <div class="row">
        <div class="col-md-3">
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Filters</h5>
                </div>
                <div class="card-body">
                    <form method="GET" action="">
                        <div class="mb-3">
                            <label for="search" class="form-label">Search</label>
                            <input type="text" class="form-control" id="search" name="search" value="<?php echo htmlspecialchars($search); ?>">
                        </div>
                        <div class="mb-3">
                            <label for="category" class="form-label">Category</label>
                            <select class="form-select" id="category" name="category">
                                <option value="">All Categories</option>
                                <?php while ($cat = $categories->fetchArray()): ?>
                                    <option value="<?php echo $cat['id']; ?>" <?php echo $category == $cat['id'] ? 'selected' : ''; ?>>
                                        <?php echo htmlspecialchars($cat['name']); ?>
                                    </option>
                                <?php endwhile; ?>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Apply Filters</button>
                    </form>
                </div>
            </div>
        </div>
        
        <div class="col-md-9">
            <div class="row">
                <?php while ($book = $books->fetchArray(SQLITE3_ASSOC)): ?>
                    <div class="col-md-4 mb-4">
                        <div class="card h-100">
                            <img src="<?php echo htmlspecialchars($book['cover_image'] ?? '/assets/img/no-cover.jpg'); ?>" 
                                 class="card-img-top" alt="<?php echo htmlspecialchars($book['title']); ?>">
                            <div class="card-body">
                                <h5 class="card-title"><?php echo htmlspecialchars($book['title']); ?></h5>
                                <h6 class="card-subtitle mb-2 text-muted">By <?php echo htmlspecialchars($book['author']); ?></h6>
                                <p class="card-text small">
                                    <?php echo htmlspecialchars(substr($book['description'] ?? '', 0, 100)) . '...'; ?>
                                </p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="badge bg-secondary"><?php echo htmlspecialchars($book['category_name'] ?? 'Uncategorized'); ?></span>
                                    <a href="book.php?id=<?php echo $book['id']; ?>" class="btn btn-sm btn-primary">View Details</a>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endwhile; ?>
            </div>
        </div>
    </div>
</div>

<?php include '../templates/footer.php'; ?>
