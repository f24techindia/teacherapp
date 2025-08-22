<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$class_id = isset($_GET['class_id']) ? $_GET['class_id'] : null;

$query = "SELECT s.*, c.name as class_name 
          FROM students s 
          LEFT JOIN classes c ON s.class_id = c.id";

if ($class_id) {
    $query .= " WHERE s.class_id = ?";
    $stmt = $db->prepare($query . " ORDER BY s.name ASC");
    $stmt->execute([$class_id]);
} else {
    $stmt = $db->prepare($query . " ORDER BY s.name ASC");
    $stmt->execute();
}

$students = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $students[] = $row;
}

echo json_encode([
    "success" => true,
    "students" => $students
]);
?>