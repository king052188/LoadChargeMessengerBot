<?php namespace App;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;

class SMSQueue extends \Eloquent {
    protected $table = 'tbl_sms_queue';
}
