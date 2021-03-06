<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\SMSQueue;

use PollyCodes\Load4wrd\Loading;

class SMSController extends Controller
{
    //
    public function test_load($target, $code) {

      $loading = new Loading();

      $json = $loading->Send($target, $code);

      dd($json);
    }

    public function get_sms() {
      $sms = SMSQueue::where("status", 0)->get();
      return array(
        "status" => 200,
        "message" => "Success",
        "count" => COUNT($sms),
        "data" => $sms
      );
    }

    public function update_sms($uid) {
      $r = SMSQueue::where("Id", (int)$uid)
      ->update(
        array('status' => 1)
      );

      if($r) {
        return array(
          "status" => 200,
          "message" => "Success"
        );
      }

      return array(
        "status" => 500,
        "message" => "Fail"
      );
    }
}
