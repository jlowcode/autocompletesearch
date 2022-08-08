<?php

/**
 * 
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.list.autocompletesearch
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */


// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\Utilities\ArrayHelper;

// Require the abstract plugin class
require_once COM_FABRIK_FRONTEND . '/models/plugin-list.php';


/**
 *  Determines if a row is editable
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.list.autocompletesearch
 * @since       3.0
 */


class PlgFabrik_ListAutocompleteSearch extends PlgFabrik_List
{

    /**
	 * Return the javascript to create an instance of the class defined in formJavascriptClass
	 *
	 * @param   array  $args  Array [0] => string table's form id to contain plugin
	 *
	 * @return bool
	 */
	public function onLoadJavascriptInstance($args)
	{
		$params = $this->getParams();
		$input = $this->app->input;
		$listId = $input->getInt('listid');;

		parent::onLoadJavascriptInstance($args);

		$opts = $this->getElementJSOptions();
		$opts->acl = $this->acl;
		$opts->elName = str_replace('.', '___', $params->get('autocompletesearch_field'));
		$opts->listid = $listId;

		$opts = json_encode($opts);
		$this->jsInstance = "new FbListAutocompletesearch($opts)";

		return true;
	}


	/**
	 * Load the AMD module class name
	 *
	 * @return string
	 */
	public function loadJavascriptClassName_result()
	{
		return 'FbListAutocompletesearch';
	}



	/**
	 * Get the element table object
	 *
	 * @param   bool $force default false - force load the element
	 *
	 * @return  FabrikTableElement  element table
	 */
	public function &getElement($force = false)
	{
		if (!$this->element || $force) {
			JTable::addIncludePath(JPATH_ADMINISTRATOR . '/components/com_fabrik/tables');
			$row = FabTable::getInstance('Element', 'FabrikTable');
			$row->load($this->id);
			$this->element = $row;

			// 3.1 reset the params at the same time. Seems to be required for ajax autocomplete
			if ($force) {
				unset($this->params);
				$this->getParams();
			}
		}

		return $this->element;
	}


	/**
	 * Ajax call to get auto complete options (now caches results)
	 *
	 * @return  string  json encoded options
	 */
	public function onAutocomplete_options()
	{
		// Needed for ajax update (since we are calling this method via dispatcher element is not set)
		$input = $this->app->input;
		$listRefId = $input->getInt('listref');

		$cache  = FabrikWorker::getCache();
		$search = $input->get('value', '', 'string');
		$elName = $input->get('elName', '', 'string');

		// uh oh, can't serialize PDO db objects so no can cache, as J! serializes the args
		if ($this->config->get('dbtype') === 'pdomysql') {
			echo $this->cacheAutoCompleteOptions($this, $search, $elName, $listRefId);
		} else {
			echo $cache->call(array(get_class($this), 'cacheAutoCompleteOptions'), $this, $search, $elName, $listRefId);
		}

	}

	/**
	 * Cache method to populate auto-complete options
	 *
	 * @param   plgFabrik_Element $elementModel element model
	 * @param   string            $search       search string
	 * @param   array             $opts         options, 'label' => field to use for label (db join)
	 *
	 * @since   3.0.7
	 *
	 * @return string  json encoded search results
	 */
	public static function cacheAutoCompleteOptions($elementModel, $search, $elName, $listRefId)
	{
		$listModel = JModelLegacy::getInstance('List', 'FabrikFEModel');
		$listModel->setId($listRefId);
		$formModel = $listModel->getFormModel();

		$arrAlFilters = array();
		
		$regex  = "/(?=.*" .
			implode(")(?=.*",
				array_filter(explode(" ", preg_quote($search, '/')))
			) . ").*/i";

		$withAccents = array('à', 'á', 'â', 'ã', 'ä', 'å', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 
		'í', 'î', 'ï', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', 'ù', 'ü', 'ú', 'ÿ', 'À', 'Á', 'Â', 
		'Ã', 'Ä', 'Å', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ñ', 'Ò', 'Ó', 'Ô', 
		'Õ', 'Ö', 'O', 'Ù', 'Ü', 'Ú');

		$withoutAccents = array('a', 'a', 'a', 'a', 'a', 'a', 'c', 'e', 'e', 'e', 'e', 'i', 
		'i', 'i', 'i', 'n', 'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'y', 'A', 'A', 'A', 'A', 'A', 
		'A', 'C', 'E', 'E', 'E', 'E', 'I', 'I', 'I', 'I', 'N', 'O', 'O', 'O', 'O', 'O', '0', 'U', 'U', 'U');

		foreach($listModel->getData()[0] as $val){
			if(isset($val->$elName) && !empty($val->$elName)){
				$arrSplited = array_filter(explode('<br>', $val->$elName));
				if(!empty($arrSplited)){
					foreach($arrSplited as $key => $strArr){
						if(!preg_match(str_replace($withAccents, $withoutAccents, $regex), str_replace($withAccents, $withoutAccents, $strArr))){
							unset($arrSplited[$key]);
						} else {
							$objResult = new stdClass();
							$objResult->id = $strArr;
							$objResult->text = $strArr;
							$arrAlFilters[] = $objResult;
						}
	
					}
				}
			}
		
		}

		return json_encode($arrAlFilters);
	}



	public function getElementsNameById(){
		$params = $this->getParams();

		return $params->get('list_search_elements');
	}



	public function getAutoCompleteLimitOptions(){
		$usersConfig = JComponentHelper::getParams('com_fabrik');

		return (int) $usersConfig->get('autocomplete_max_rows', '10');
	}

}