<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Company;
use App\Dealer;
use App\DealerType;
use App\Wallet;
use App\Loading;
use App\ProductCode;
use App\SMSQueue;
use App\LoadLogs;
use DB;
use Exception;
use Ramsey\Uuid\Uuid;


class L4DHelper extends Controller
{
    //
    public static $load_api = "staging.kpa.ph:8066";

    public static $company_name = "EnghagePro";

    public static $fb_access_token = "EAAC1VxtCsysBAIz0Q01ZCnm50AwOskgTq9sgnuYoLtQ1D4tF6XMHtU6U0hRFrXEsZC3G2w798ZA9UZBEndUwrAdte5EYuOY61VqoOTYNJzZC3SBLlMDpmweOeUXNpRR1jsdk0oIPfkuCwuiorsiu6sERJauc7v3Dqxkec6ZCZAV6QZDZD";

    // static method

    public static function access_token() {
      $guid = null;
      $c = null;
      do {
        $uuid = Uuid::uuid4();
        $guid = $uuid->toString();



      }while($c != null);
      return $guid;
    }

    public static function get_company_info($guid) {
      $c = Company::where('access_token', $guid)->first();
      return $c;
    }

    public static function network($value) {
      $net = 0;
      switch ($value) {
        case 'SMART':
          $net = 1;
          break;
        case 'GLOBE':
          $net = 2;
          break;
        default:
          $net = 3;
          break;
      }
      return $net;
    }

    public static function prefix($mobile) {
        $net = "INVALID";

        if (strlen($mobile) == 11)
        {
            switch (substr($mobile, 0, 4))
            {
                case "0900":
                case "0907":
                case "0908":
                case "0909":
                case "0910":
                case "0911":
                case "0912":
                case "0913":
                case "0914":
                case "0918":
                case "0919":
                case "0920":
                case "0921":
                case "0928":
                case "0929":
                case "0930":
                case "0938":
                case "0939":
                case "0940":
                case "0946":
                case "0947":
                case "0948":
                case "0949":
                case "0950":
                case "0951":
                case "0970":
                case "0971":
                case "0980":
                case "0989":
                case "0992":
                case "0998":
                case "0999":
                case "0813":
                    $net = "SMART";
                    break;
                case "0905":
                case "0906":
                case "0915":
                case "0916":
                case "0917":
                case "0926":
                case "0927":
                case "0935":
                case "0936":
                case "0937":
                case "0945":
                case "0955":
                case "0956":
                case "0965":
                case "0975":
                case "0976":
                case "0977":
                case "0978":
                case "0979":
                case "0994":
                case "0995":
                case "0996":
                case "0997":
                case "0817":
                    $net = "INVALID";
                    break;
                case "0922":
                case "0923":
                case "0924":
                case "0925":
                case "0931":
                case "0932":
                case "0933":
                case "0934":
                case "0941":
                case "0942":
                case "0943":
                case "0944":
                    $net = "SUN";
                    break;
                default:
                    $net = "INVALID";
                    break;
            }
        }
        return $net;
    }

    // instance method

    public function transaction_number() {
      return date("ymd") . substr(number_format(time() * rand(), 0,'',''), 0, 10);
    }

    public function trans_num() {
      $num = null;
      $w = null;

      do {
        $num = $this->transaction_number();
        $w = Wallet::where('reference', $num)->first();
      }while($w != null);

      return $num;
    }

    public function one_time_password() {
      return substr(number_format(time() * rand(),0,'',''),0,6);
    }

    public function get_load_keyword($network, $prod_code, $custom = null) {

      $cmd = "custom_cmd = '{$prod_code}'";
      if($custom==null) {
        $cmd = "keyword = '{$prod_code}'";
      }

      $q = DB::select("
        SELECT * FROM
        tbl_load_product_codes
        WHERE network = {$network}
        AND {$cmd}
      ");
      $count = COUNT($q);
      return array(
        "status" => $count > 0 ? 200 : 404,
        "data" => $count > 0 ? $q : null
      );
    }

    public function get_wallet_summary($dealer_id) {
      $d_uid = (int)$dealer_id;
      $str = DB::select("
        SELECT
          (SELECT CASE WHEN SUM(amount) > 0 THEN SUM(amount) ELSE 0 END FROM tbl_wallet WHERE dealer_id = {$d_uid} AND type = 1 AND status = 1) AS credits,
          (SELECT CASE WHEN SUM(amount) > 0 THEN SUM(amount) ELSE 0 END FROM tbl_wallet WHERE dealer_id = {$d_uid} AND type = 0 AND status = 1) AS debits,
          (
          	(SELECT CASE WHEN SUM(amount) > 0 THEN SUM(amount) ELSE 0 END FROM tbl_wallet WHERE dealer_id = {$d_uid} AND type = 1 AND status = 1) -
              (SELECT CASE WHEN SUM(amount) > 0 THEN SUM(amount) ELSE 0 END FROM tbl_wallet WHERE dealer_id = {$d_uid} AND type = 0 AND status = 1)
          ) AS available;
      ");

      return array(
        "wallet" => $str
      );
    }

    public function get_user_info($company_id, $user_account, $isMobile = false) {

      if($isMobile) {
        $dealer = DB::select("
          SELECT * FROM tbl_dealers
          WHERE company_id = {$company_id}
          AND mobile = '{$user_account}';
        ");
      }
      else {
        $dealer = DB::select("
          SELECT * FROM tbl_dealers
          WHERE company_id = {$company_id}
          AND facebook_id = '{$user_account}'
        ");
      }

      return $dealer;
    }

    public function get_type_info($company_id, $code) {
      $type = DB::select("SELECT * FROM tbl_dealers_type WHERE company_id = {$company_id} AND code = '{$code}';");
      if(COUNT($type) > 0) {
        return $type[0];
      }
      return null;
    }

    public function message($title, $mobile, $customize = null) {
      switch ($title) {
        case 'welcome':
          return "Welcome to {$this::$company_name}, you are now successfully registered.";
        case 'otp':
          return $customize;
      }
    }

    public function sms_queue($mobile, $message) {
      $s = new SMSQueue();
      $s->company_uid = 4;
      $s->user_id = $mobile;
      $s->user_ip_address = 0;
      $s->mobile = $mobile;
      $s->message = $message;
      $s->status = 0;
      return $s->save();
    }

    public function add_load_logs($duid, $description, $amount) {
      $ref_number = $this->trans_num();

      $l = new LoadLogs();
      $l->dealer_id = $duid;
      $l->reference = $ref_number;
      $l->description = $description;
      $l->amount = $amount;
      $l->type = 0;
      $l->status = 0;

      if($l->save()) {
        return array(
          "status" => 200,
          "reference" => $ref_number,
          "last_id" => $l->id
        );
      }

      return array(
        "status" => 500,
        "reference" => null,
        "last_id" => -1
      );
    }

    public function add_wallet($duid, $ref_number, $description, $amount, $type = 0) {
      // $ref_number = $this->trans_num();

      $s = new Wallet();
      $s->dealer_id = $duid;
      $s->reference = $ref_number;
      $s->description = $description;
      $s->amount = $amount;
      $s->type = $type;
      $s->status = 1;

      if($s->save()) {
        return array(
          "status" => 200,
          "reference" => $ref_number,
          "last_id" => $s->id
        );
      }

      return array(
        "status" => 500,
        "reference" => null,
        "last_id" => -1
      );
    }

    public function add_loading_transaction($ref_number, $network, $transaction, $target, $product_code, $amount) {
      $l = new Loading();
      $l->reference = $ref_number;
      $l->network_provider = $network;
      $l->transaction_number = $transaction;
      $l->target_mobile_number = $target;
      $l->product_code = $product_code;
      $l->amount = $amount;
      $l->status = 1;

      if($l->save()) {
        return array(
          "status" => 200,
          "reference" => $ref_number,
          "last_id" => $l->id
        );
      }

      return array(
        "status" => 500,
        "reference" => null,
        "last_id" => -1
      );
    }

    public function update_loadlogs($reference, $status = 1) {

      $w = LoadLogs::where('reference', $reference)
          ->update( ["status" => $status] );

      if($w) {
        return true;
      }

      return false;
    }

    public function update_wallet($reference, $status = 1) {

      $w = Wallet::where('reference', $reference)
          ->update( ["status" => $status] );

      if($w) {
        return true;
      }

      return false;
    }


    public function curl_execute($data, $path, $custom_url = null) {
      // Email API
      $url = "http://". $this::$load_api . $path;
      if($custom_url != null) {
        $url = $custom_url;
      }

      // Array to Json
      $to_json = json_encode($data);

      // Added JSON Header
      $headers = array('Accept: application/json','Content-Type: application/json');

      $ch = curl_init($url);
      curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_POSTFIELDS, $to_json);
      curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
      $result = json_decode(curl_exec($ch), true);
      curl_close($ch);
      return $result;
    }

    public function curl_fb_execute($user_id) {
      // Email API
      $url = "https://graph.facebook.com/v2.12/". $user_id . "?access_token=" . $this::$fb_access_token;

      // Added JSON Header
      $headers = array('Accept: application/json','Content-Type: application/json');

      $ch = curl_init($url);
      curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
      curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
      $result = json_decode(curl_exec($ch), true);
      curl_close($ch);
      return $result;
    }

    public function toINT($value) {
      $r = -0;
      try {
        $r = (int)$value;
      }
      catch(\Exception $e) {
        $r = 1;
      }
      return $r;
    }

    public function init_command($access_token, $request_type = "web", Request $request) {

      $uid = $request->fb_id;
      $command = $request->command;

      if (strpos($command, $this::$CMDPrefix) !== false) {
        $commands = explode(" ", $command);

        if(COUNT($commands) > 1 && COUNT($commands) == 2) {
          $data = explode("/", $commands[2]);
          $return = [];
          switch ($commands[0]) {
            case 'REG':
              dd($data);
              break;
            case 'CODE':
              dd($data);
              break;
            case 'MPIN':
              dd($data);
              break;
            case 'TLW':
              break;

            default:
              $return = array(
                'status' => 404,
                'message' => "{$this::$user_first_name}\r\Invalid command - Code1, please try again."
              );
              break;
          }
          return $return;
        }

        if(COUNT($commands) > 2 && COUNT($commands) == 3) {
          $data = explode("/", $commands[2]);
          $return = [];
          switch ($commands[0]) {
            case 'LC':
              dd($data);
              break;

            default:
              // product codes
              $product_codes = $helper->get_load_keyword(
                L4DHelper::network($network),
                $code
              );
              $return = array(
                'status' => 404,
                'message' => "{$this::$user_first_name}\r\Invalid command - Code2, please try again."
              );
              break;
          }
          return $return;


        }

      }
    }
}
