<?php
require_once '../src/config/database.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$user_id = $_SESSION['user_id'];
$success = '';
$error = '';
$debug_sql = '';

// Get current user data
$result = query("SELECT * FROM users WHERE id = $user_id");
$user = $result->fetchArray(SQLITE3_ASSOC);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $full_name = $_POST['full_name'];
    $bio = $_POST['bio'];
    
    // Intentionally vulnerable to SQL injection in full_name field only
    // Other fields are sanitized for stability
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);
    $bio = htmlspecialchars($bio);
    
    // Vulnerable to SQL injection through full_name
    $sql = "UPDATE users SET 
            email = '$email',
            full_name = '$full_name',  -- Vulnerable field
            bio = '$bio'
            WHERE id = $user_id";
            
    try {
        query($sql);
        $_SESSION['full_name'] = $full_name;
        $success = 'Profile updated successfully!';
        
        // For educational purposes, show the injected SQL
        if (strpos($full_name, "'") !== false) {
            $debug_sql = $sql;
        }
        
        // Refresh user data
        $result = query("SELECT * FROM users WHERE id = $user_id");
        $user = $result->fetchArray(SQLITE3_ASSOC);
    } catch (Exception $e) {
        $error = 'Failed to update profile: ' . $e->getMessage();
        if (strpos($full_name, "'") !== false) {
            $debug_sql = $sql;
        }
    }
}

include '../templates/header.php';
?>

<div class="container mt-4">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card shadow">
                <div class="card-header bg-primary text-white">
                    <h3 class="mb-0">My Profile</h3>
                </div>
                <div class="card-body p-4">
                    <?php if ($success): ?>
                        <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
                    <?php endif; ?>
                    <?php if ($error): ?>
                        <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
                    <?php endif; ?>
                    
                    <form method="POST">
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control form-control-lg" id="email" name="email" 
                                   value="<?php echo htmlspecialchars($user['email'] ?? ''); ?>" required>
                        </div>
                        <div class="mb-3">
                            <label for="full_name" class="form-label">Full Name</label>
                            <input type="text" class="form-control form-control-lg" id="full_name" name="full_name" 
                                   value="<?php echo htmlspecialchars($user['full_name'] ?? ''); ?>" required>
                            <div class="form-text text-muted">
                                Edit your display name
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="bio" class="form-label">Bio</label>
                            <textarea class="form-control form-control-lg" id="bio" name="bio" rows="3"><?php echo htmlspecialchars($user['bio'] ?? ''); ?></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-lg w-100">Update Profile</button>
                    </form>
                </div>
            </div>
            
            <?php if ($debug_sql && isset($_GET['debug'])): ?>
            <div class="card mt-4">
                <div class="card-header bg-dark text-white">
                    <h5 class="mb-0">Debug Information</h5>
                </div>
                <div class="card-body">
                    <pre class="mb-0"><code><?php echo htmlspecialchars($debug_sql); ?></code></pre>
                </div>
            </div>
            <?php endif; ?>
            
            <div class="card mt-4 shadow">
                <div class="card-header bg-dark text-white">
                    <h3 class="mb-0">My Activity</h3>
                </div>
                <div class="card-body p-4">
                    <h4>Recent Borrows</h4>
                    <?php
                    try {
                        $borrows_sql = "SELECT b.title, br.borrowed_date, br.returned_date, br.due_date, br.status, c.name as category 
                                       FROM borrowings br 
                                       JOIN books b ON br.book_id = b.id 
                                       LEFT JOIN categories c ON b.category_id = c.id 
                                       WHERE br.user_id = $user_id 
                                       ORDER BY br.borrowed_date DESC 
                                       LIMIT 5";
                        $borrows = query($borrows_sql);
                        
                        if ($borrows) {
                            echo "<div class='list-group'>";
                            $has_borrows = false;
                            
                            while ($borrow = $borrows->fetchArray(SQLITE3_ASSOC)) {
                                $has_borrows = true;
                                ?>
                                <div class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-1"><?php echo htmlspecialchars($borrow['title']); ?></h6>
                                            <?php if (isset($borrow['category']) && $borrow['category']): ?>
                                                <small class="text-muted"><?php echo htmlspecialchars($borrow['category']); ?></small>
                                            <?php endif; ?>
                                        </div>
                                        <div class="text-end">
                                            <div class="text-muted small">
                                                <?php if (isset($borrow['borrowed_date'])): ?>
                                                    Borrowed: <?php echo htmlspecialchars(date('M d, Y', strtotime($borrow['borrowed_date']))); ?>
                                                <?php endif; ?>
                                            </div>
                                            <?php if (isset($borrow['due_date'])): ?>
                                                <div class="text-muted small">
                                                    Due: <?php echo htmlspecialchars(date('M d, Y', strtotime($borrow['due_date']))); ?>
                                                </div>
                                            <?php endif; ?>
                                            <?php if (isset($borrow['returned_date'])): ?>
                                                <div class="text-success small">
                                                    Returned: <?php echo htmlspecialchars(date('M d, Y', strtotime($borrow['returned_date']))); ?>
                                                </div>
                                            <?php elseif ($borrow['status'] === 'borrowed'): ?>
                                                <div class="text-warning small">Not returned</div>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                                <?php
                            }
                            
                            if (!$has_borrows) {
                                echo "<div class='list-group-item text-muted text-center'>No books borrowed yet</div>";
                            }
                            
                            echo "</div>";
                        } else {
                            echo "<div class='alert alert-info'>No borrowing history available</div>";
                        }
                    } catch (Exception $e) {
                        echo "<div class='alert alert-warning'>Unable to load borrowing history</div>";
                    }
                    ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include '../templates/footer.php'; ?>
