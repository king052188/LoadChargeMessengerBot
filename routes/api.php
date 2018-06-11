<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/v2/load4wrd/product-code/get/{network?}', 'ApiController@get_product_codes');


Route::get('/v1/verify/{access_token}', 'L4DBotController@verification');
Route::get('/v1/register/{access_token}', 'L4DBotController@register');

Route::get('/v1/load/command/{access_token}/{request_type?}', 'L4DBotController@command_keyword');
Route::get('/v1/load/link/{access_token}/{request_type?}', 'L4DBotController@link_messenger');

Route::get('/v1/load/proceed/{access_token}', 'L4DBotController@proceed_load_request');
Route::get('/v1/generate/uuid', 'L4DHelper@access_token');

Route::get('/v1/sms/get', 'SMSController@get_sms');
Route::get('/v1/sms/update/{id}', 'SMSController@update_sms');

Route::get('/v1/load/verify', 'L4DBotController@verify_load');
