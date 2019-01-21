

<?php
$name = filter_input(INPUT_POST, 'name');
$score = filter_input(INPUT_POST, 'score');
$time = filter_input(INPUT_POST, 'time');

//Connect to Server 
$host = "localhost";          // host of database server
$username = "demarcusL";       //username to access database server
$passwd = '7642';         //password to access database server
$dbname = "demarcusL";         // the database used.
//establish connection
$conn = new mysqli($host, $username, $passwd, $dbname);

//If unsuccessful
if ($conn->connect_errno) {
    echo "Not Connected to Database";
}
//If successful
else {
    echo "$score $name $time";
    $conn->query("INSERT INTO BlockGameTable(name,score,survivetime) VALUES('$name',$score,$time);") or die('Fail..' . $conn->error);
    $conn->close();
}