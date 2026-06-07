<?php
namespace App\Core;

use Config\Database as ConfigDatabase;
use PDO;

class Database {
    public static function getConnection(): PDO {
        return ConfigDatabase::getConnection();
    }
}
