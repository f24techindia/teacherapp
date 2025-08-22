<?php
class Database {
    private $host = "localhost";
    private $db_name = "u925328211_edumate";
    private $username = "u925328211_edumate";
    private $password = "Aman123@f24tech24";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }

    public function createTables() {
        $queries = [
            "CREATE TABLE IF NOT EXISTS teachers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )",
            
            "CREATE TABLE IF NOT EXISTS classes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )",
            
            "CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                phone VARCHAR(20),
                class_id INT,
                roll_number VARCHAR(20),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            )",
            
            "CREATE TABLE IF NOT EXISTS assignments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                class_id INT NOT NULL,
                due_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            )",
            
            "CREATE TABLE IF NOT EXISTS fees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                fee_type VARCHAR(100) NOT NULL,
                status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
                due_date DATE,
                paid_date DATE NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )",
            
            "CREATE TABLE IF NOT EXISTS notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                content TEXT,
                class_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            )",
            
            "CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                class_id INT NOT NULL,
                date DATE NOT NULL,
                status ENUM('present', 'absent', 'late') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                UNIQUE KEY unique_attendance (student_id, class_id, date)
            )"
        ];

        foreach ($queries as $query) {
            try {
                $this->conn->exec($query);
            } catch(PDOException $e) {
                echo "Error creating table: " . $e->getMessage() . "\n";
            }
        }

        // Insert default teacher if not exists
        $check_teacher = $this->conn->prepare("SELECT COUNT(*) FROM teachers WHERE username = ?");
        $check_teacher->execute(['teacher']);
        if ($check_teacher->fetchColumn() == 0) {
            $insert_teacher = $this->conn->prepare("INSERT INTO teachers (username, password) VALUES (?, ?)");
            $insert_teacher->execute(['teacher', password_hash('1234', PASSWORD_DEFAULT)]);
        }
    }
}
?>