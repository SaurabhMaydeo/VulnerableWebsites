<?php
require_once '../src/config/database.php';

$error = '';
$debug_sql = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    // Vulnerable to SQL injection
    $sql = "SELECT * FROM users WHERE email = '$email' AND password = '$password'";
    $result = query($sql);
    $debug_sql = $sql;
    
    if ($row = $result->fetchArray()) {
        $_SESSION['user_id'] = $row['id'];
        $_SESSION['role'] = $row['role'];
        $_SESSION['full_name'] = $row['full_name'];
        $_SESSION['email'] = $row['email'];
        header('Location: index.php');
        exit;
    } else {
        $error = 'Invalid email or password';
    }
}

include '../templates/header.php';
?>

<div class="container mt-4">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card shadow">
                <div class="card-header bg-primary text-white">
                    <h2 class="h4 mb-0">Login to VulnLibrary</h2>
                </div>
                <div class="card-body p-4">
                    <?php if ($error): ?>
                        <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
                    <?php endif; ?>
                    
                    <form method="POST">
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control form-control-lg" id="email" name="email" required>
                            <div class="form-text text-muted">Try: admin@library.com</div>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control form-control-lg" id="password" name="password" required>
                            <div class="form-text text-muted">Try: admin123</div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">Login</button>
                        <div class="text-center">
                            <p class="mb-0">Don't have an account? <a href="register.php" class="text-primary">Register here</a></p>
                        </div>
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
            

        </div>
    </div>
</div>

<?php include '../templates/footer.php'; ?>
                        Don't have an account? <a href="register.php">Register here</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include '../templates/footer.php'; ?>
