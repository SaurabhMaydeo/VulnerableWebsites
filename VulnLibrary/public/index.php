<?php
require_once '../src/config/database.php';
include '../templates/header.php';

// Vulnerable search functionality
$search = isset($_GET['search']) ? $_GET['search'] : '';
if ($search) {
    // Vulnerable to SQL injection
    $result = query("SELECT * FROM books WHERE title LIKE '%$search%' OR author LIKE '%$search%'");
}
?>

<div class="container mt-5">
    <h1>Welcome to VulnLibrary</h1>
    
    <form class="my-4" method="GET">
        <div class="input-group">
            <input type="text" name="search" class="form-control" placeholder="Search books..." value="<?php echo htmlspecialchars($search); ?>">
            <button class="btn btn-primary" type="submit">Search</button>
        </div>
    </form>

    <?php if (isset($result)): ?>
        <div class="row">
            <?php while ($book = $result->fetchArray(SQLITE3_ASSOC)): ?>
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <img src="<?php echo htmlspecialchars($book['cover_image'] ?? '/assets/img/no-cover.jpg'); ?>" class="card-img-top" alt="Book cover">
                        <div class="card-body">
                            <h5 class="card-title"><?php echo htmlspecialchars($book['title']); ?></h5>
                            <p class="card-text">By <?php echo htmlspecialchars($book['author']); ?></p>
                            <a href="book.php?id=<?php echo $book['id']; ?>" class="btn btn-primary">View Details</a>
                        </div>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    <?php endif; ?>
</div>

<?php include '../templates/footer.php'; ?>
