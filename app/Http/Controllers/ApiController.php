<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;

class ApiController extends Controller
{
    //

    public function get_product_codes($network_id = null) {

      L4DHelper::set_access_control_allow_origin();

      if($network_id != null) {
        $net_id = (int)$network_id;

        $q = DB::select("
          SELECT * FROM
          tbl_product_codes_v2
          WHERE network = {$net_id} ORDER BY load_type ASC;
        ");
      }
      else {
        $q = DB::select("
          SELECT * FROM
          tbl_product_codes_v2;
        ");
      }

      return array(
        "status" => 200,
        "message" => "successful",
        "count" => COUNT($q),
        "data" => $q
      );
    }
}
