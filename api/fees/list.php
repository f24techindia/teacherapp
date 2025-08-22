<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$status = isset($_GET['status']) ? $_GET['status'] : null;

$query = "SELECT f.*, s.name as student_name, c.name as class_name 
          FROM fees f 
          LEFT JOIN students s ON f.student_id = s.id 
          LEFT JOIN classes c ON s.class_id = c.id";

if ($status && $status !== 'all') {
    $query .= " WHERE f.status = ?";
    $stmt = $db->prepare($query . " ORDER BY f.due_date DESC");
    $stmt->execute([$status]);
} else {
    $stmt = $db->prepare($query . " ORDER BY f.due_date DESC");
    $stmt->execute();
}

$fees = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $fees[] = $row;
}

echo json_encode([
    "success" => true,
    "fees" => $fees
]);
?>