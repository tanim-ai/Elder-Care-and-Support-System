<?php
// Add missing feature tables without changing existing resident or account data.
function ensure_portal_schema(mysqli $connection): void
{
    $sql = file_get_contents(__DIR__ . '/../database/portal_features.sql');
    foreach (explode(';', $sql) as $statement) {
        if (trim($statement) !== '') $connection->query($statement);
    }
    // Older billing installations do not contain payer metadata.
    foreach (['billing' => ['paid_by_user_id' => 'BIGINT UNSIGNED NULL', 'paid_by_role' => 'VARCHAR(20) NULL'],
              'payments' => ['paid_by_user_id' => 'BIGINT UNSIGNED NULL', 'paid_by_role' => 'VARCHAR(20) NULL']] as $table => $columns) {
        foreach ($columns as $column => $type) {
            $result = $connection->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
            if (!$result->num_rows) $connection->query("ALTER TABLE `$table` ADD COLUMN `$column` $type");
        }
    }
}
