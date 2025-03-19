<?php
require_once '../src/config/database.php';

$error = '';
$success = '';
$debug_sql = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $full_name = $_POST['full_name'] ?? '';
    $bio = $_POST['bio'] ?? '';
    
    // Intentionally vulnerable to SQL injection
    $sql = "INSERT INTO users (email, password, full_name, bio, role) 
            VALUES ('$email', '$password', '$full_name', '$bio', 'user')";
    
    try {
        query($sql);
        $success = 'Registration successful! You can now login.';
        $debug_sql = $sql; // For demonstration purposes
    } catch (Exception $e) {
        $error = 'Registration failed: ' . $e->getMessage();
        $debug_sql = $sql; // For demonstration purposes
    }
}
?>

<?php include '../templates/header.php'; ?>

<div class="container mt-4">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card shadow">
                <div class="card-header bg-primary text-white">
                    <h3 class="text-center mb-0">Create Account</h3>
                </div>
                <div class="card-body p-4">
                    <?php if ($error): ?>
                        <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
                    <?php endif; ?>
                    <?php if ($success): ?>
                        <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
                    <?php endif; ?>
                    
                    <form method="POST" action="">
                        <div class="mb-3">
                            <label for="email" class="form-label">Email Address</label>
                            <input type="email" class="form-control form-control-lg" id="email" name="email" required>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control form-control-lg" id="password" name="password" required>
                        </div>
                        <div class="mb-3">
                            <label for="full_name" class="form-label">Full Name</label>
                            <input type="text" class="form-control form-control-lg" id="full_name" name="full_name" required>
                            <div class="form-text text-muted">
                                Enter your full name as you'd like it to be displayed
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="bio" class="form-label">Bio</label>
                            <textarea class="form-control form-control-lg" id="bio" name="bio" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">Create Account</button>
                        <div class="text-center">
                            Already have an account? <a href="login.php" class="text-primary">Login here</a>
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
