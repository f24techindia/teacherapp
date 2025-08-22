<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Create tables if they don't exist
$database->createTables();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    $query = "SELECT id, username, password FROM teachers WHERE username = ?";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $data->username);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (password_verify($data->password, $row['password'])) {
            $token = base64_encode($row['id'] . ':' . $row['username'] . ':' . time());
            
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Login successful",
                "token" => $token,
                "teacher_id" => $row['id']
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Invalid credentials"
            ]);
        }
    } else {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid credentials"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Username and password required"
    ]);
}
?>