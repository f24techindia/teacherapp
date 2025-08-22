<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->title) && !empty($data->class_id)) {
    $query = "UPDATE assignments SET title = ?, description = ?, class_id = ?, due_date = ? WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        $data->title,
        $data->description ?? '',
        $data->class_id,
        $data->due_date ?? null,
        $data->id
    ])) {
        echo json_encode([
            "success" => true,
            "message" => "Assignment updated successfully"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to update assignment"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Assignment ID, title, and class are required"
    ]);
}
?>