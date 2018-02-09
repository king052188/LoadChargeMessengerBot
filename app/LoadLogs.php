<?php namespace App;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;

class LoadLogs extends \Eloquent {
    protected $table = 'tbl_load_request_logs';
}
