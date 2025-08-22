<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$query = "SELECT * FROM classes ORDER BY name ASC";
$stmt = $db->prepare($query);
$stmt->execute();

$classes = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $classes[] = $row;
}

echo json_encode([
    "success" => true,
    "classes" => $classes
]);
?>