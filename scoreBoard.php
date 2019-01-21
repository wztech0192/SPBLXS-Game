<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//Connect to Server 
$host = "localhost";          // host of database server
$username = "demarcusL";       //username to access database server
$passwd = '7642';         //password to access database server
$dbname = "demarcusL";         // the database used.
//establish connection
$conn = new mysqli($host, $username, $passwd, $dbname);

//If unsuccessful
if ($conn->connect_errno) {
    echo "fail";
}
//If successful
else {

    $result = $conn->query("SELECT * FROM `BlockGameTable` ORDER BY score DESC LIMIT 10;") or die('Fail..' . $conn->error);
    
    while($row = $result->fetch_assoc()) {
        $databack[] = $row;
    }
    echo json_encode($databack);
    $conn->close();
}