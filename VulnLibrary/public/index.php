<?php
require_once '../src/config/database.php';
include '../templates/header.php';

// Get featured books
$featured_sql = "SELECT b.*, c.name as category_name 
               FROM books b 
               LEFT JOIN categories c ON b.category_id = c.id 
               LIMIT 6";
$featured_books = query($featured_sql);

// Get all categories with book count
$categories_sql = "SELECT c.*, COUNT(b.id) as book_count 
                  FROM categories c 
                  LEFT JOIN books b ON c.id = b.category_id 
                  GROUP BY c.id";
$categories = query($categories_sql);

// Vulnerable search functionality (intentionally)
$search = isset($_GET['search']) ? $_GET['search'] : '';
$search_results = null;

if ($search) {
    $search_sql = "SELECT b.*, c.name as category_name 
                   FROM books b 
                   LEFT JOIN categories c ON b.category_id = c.id 
                   WHERE b.title LIKE '%$search%' 
                   OR b.author LIKE '%$search%' 
                   OR b.isbn LIKE '%$search%'";
    $search_results = query($search_sql);
}
?>

<div class="container mt-4">
    <!-- Hero Section -->
    <div class="p-5 mb-4 bg-light rounded-3">
        <div class="container-fluid py-5">
            <h1 class="display-5 fw-bold">Welcome to VulnLibrary</h1>
            <p class="col-md-8 fs-4">Discover thousands of books in our collection. Search, borrow, and explore!</p>
            <form class="mt-4" method="GET" action="">
                <div class="input-group input-group-lg">
                    <input type="text" name="search" class="form-control" 
                           placeholder="Search by title, author, or ISBN..." 
                           value="<?php echo htmlspecialchars($search); ?>">
                    <button class="btn btn-primary" type="submit">Search</button>
                </div>
            </form>
        </div>
    </div>

    <?php if ($search): ?>
    <!-- Search Results -->
    <div class="mb-5">
        <h2 class="mb-4">Search Results for "<?php echo htmlspecialchars($search); ?>"</h2>
        <?php if ($search_results): ?>
            <div class="row row-cols-1 row-cols-md-3 g-4">
                <?php 
                $has_results = false;
                while ($book = $search_results->fetchArray(SQLITE3_ASSOC)):
                    $has_results = true;
                ?>
                    <div class="col">
                        <div class="card h-100 shadow-sm">
                            <div class="position-relative">
                                <img src="<?php echo htmlspecialchars($book['cover_image'] ?? '/assets/img/no-cover.jpg'); ?>" 
                                     class="card-img-top" alt="<?php echo htmlspecialchars($book['title']); ?>">
                                <span class="position-absolute top-0 end-0 badge bg-primary m-2">
                                    <?php echo htmlspecialchars($book['category_name'] ?? 'Uncategorized'); ?>
                                </span>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title"><?php echo htmlspecialchars($book['title']); ?></h5>
                                <p class="card-text text-muted">By <?php echo htmlspecialchars($book['author']); ?></p>
                                <?php if ($book['isbn']): ?>
                                    <p class="card-text"><small class="text-muted">ISBN: <?php echo htmlspecialchars($book['isbn']); ?></small></p>
                                <?php endif; ?>
                            </div>
                            <div class="card-footer bg-transparent border-top-0">
                                <a href="book.php?id=<?php echo $book['id']; ?>" class="btn btn-primary w-100">View Details</a>
                            </div>
                        </div>
                    </div>
                <?php endwhile; ?>
                <?php if (!$has_results): ?>
                    <div class="col-12">
                        <div class="alert alert-info">
                            No books found matching your search criteria.
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        <?php else: ?>
            <div class="alert alert-danger">
                Error performing search. Please try again.
            </div>
        <?php endif; ?>
    </div>
    <?php else: ?>
    <!-- Featured Books Section -->
    <div class="mb-5">
        <h2 class="mb-4">Featured Books</h2>
        <?php if ($featured_books): ?>
            <div class="row row-cols-1 row-cols-md-3 g-4">
                <?php 
                $has_featured = false;
                while ($book = $featured_books->fetchArray(SQLITE3_ASSOC)):
                    $has_featured = true;
                ?>
                    <div class="col">
                        <div class="card h-100 shadow-sm">
                            <div class="position-relative">
                                <img src="<?php echo htmlspecialchars($book['cover_image'] ?? '/assets/img/no-cover.jpg'); ?>" 
                                     class="card-img-top" alt="<?php echo htmlspecialchars($book['title']); ?>">
                                <span class="position-absolute top-0 end-0 badge bg-primary m-2">
                                    <?php echo htmlspecialchars($book['category_name'] ?? 'Uncategorized'); ?>
                                </span>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title"><?php echo htmlspecialchars($book['title']); ?></h5>
                                <p class="card-text text-muted">By <?php echo htmlspecialchars($book['author']); ?></p>
                                <?php if ($book['isbn']): ?>
                                    <p class="card-text"><small class="text-muted">ISBN: <?php echo htmlspecialchars($book['isbn']); ?></small></p>
                                <?php endif; ?>
                            </div>
                            <div class="card-footer bg-transparent border-top-0">
                                <a href="book.php?id=<?php echo $book['id']; ?>" class="btn btn-primary w-100">View Details</a>
                            </div>
                        </div>
                    </div>
                <?php endwhile; ?>
                <?php if (!$has_featured): ?>
                    <div class="col-12">
                        <div class="alert alert-info">
                            No featured books available.
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        <?php else: ?>
            <div class="alert alert-info">
                No books available at the moment.
            </div>
        <?php endif; ?>
    </div>

    <!-- Categories Section -->
    <div class="mb-5">
        <h2 class="mb-4">Browse by Category</h2>
        <div class="row row-cols-1 row-cols-md-3 g-4">
            <?php while ($category = $categories->fetchArray(SQLITE3_ASSOC)): ?>
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <h3 class="card-title h5"><?php echo htmlspecialchars($category['name']); ?></h3>
                            <p class="card-text text-muted"><?php echo $category['book_count']; ?> Books</p>
                            <a href="books.php?category=<?php echo $category['id']; ?>" class="btn btn-outline-primary">Browse Category</a>
                        </div>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    </div>
    <?php endif; ?>
</div>

<?php include '../templates/footer.php'; ?>
