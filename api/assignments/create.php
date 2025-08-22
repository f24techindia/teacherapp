<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->title) && !empty($data->class_id)) {
    $query = "INSERT INTO assignments (title, description, class_id, due_date) VALUES (?, ?, ?, ?)";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        $data->title,
        $data->description ?? '',
        $data->class_id,
        $data->due_date ?? null
    ])) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Assignment created successfully",
            "id" => $db->lastInsertId()
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to create assignment"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Assignment title and class are required"
    ]);
}
?>