<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->student_id) && !empty($data->amount) && !empty($data->fee_type)) {
    $query = "INSERT INTO fees (student_id, amount, fee_type, status, due_date, paid_date) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        $data->student_id,
        $data->amount,
        $data->fee_type,
        $data->status ?? 'pending',
        $data->due_date ?? null,
        $data->paid_date ?? null
    ])) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Fee record created successfully",
            "id" => $db->lastInsertId()
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to create fee record"
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Student, amount, and fee type are required"
    ]);
}
?>