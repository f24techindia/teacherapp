<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->name) && !empty($data->class_id)) {
    $query = "UPDATE students SET name = ?, email = ?, phone = ?, class_id = ?, roll_number = ?, address = ? WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        $data->name,
        $data->email ?? '',
        $data->phone ?? '',
        $data->class_id,
        $data->roll_number ?? '',
        $data->address ?? '',
        $data->id
    ])) {
        echo json_encode([
            "success" => true,
            "message" => "Student updated successfully"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to update student"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Student ID, name, and class are required"
    ]);
}
?>