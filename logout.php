<?php

session_start();

session_unset();
session_destroy();

header("Location: /projeto-2semestre/login.php");
exit();