<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$class_id = isset($_GET['class_id']) ? $_GET['class_id'] : null;

$query = "SELECT a.*, c.name as class_name 
          FROM assignments a 
          LEFT JOIN classes c ON a.class_id = c.id";

if ($class_id) {
    $query .= " WHERE a.class_id = ?";
    $stmt = $db->prepare($query . " ORDER BY a.due_date DESC");
    $stmt->execute([$class_id]);
} else {
    $stmt = $db->prepare($query . " ORDER BY a.due_date DESC");
    $stmt->execute();
}

$assignments = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $assignments[] = $row;
}

echo json_encode([
    "success" => true,
    "assignments" => $assignments
]);
?>