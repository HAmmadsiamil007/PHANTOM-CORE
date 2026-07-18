<?php
declare(strict_types=1);

namespace PhantomCore;

defined( 'ABSPATH' ) || exit;

class Version_Compatibility {

	private static ?self $instance = null;
	private const COMPAT_FLAG = 'phantom_1_5_0_compat';

	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function init(): void {
		if ( ! get_option( self::COMPAT_FLAG, false ) ) {
			$this->run_upgrade_tasks();
		}
	}

	public function is_upgraded(): bool {
		return false !== get_option( self::COMPAT_FLAG );
	}

	private function run_upgrade_tasks(): void {
		$tasks = array(
			'migrate_css_var_names' => array( $this, 'migrate_css_var_names' ),
		);

		foreach ( $tasks as $task => $callback ) {
			$callback();
		}

		update_option( self::COMPAT_FLAG, PHANTOM_CORE_VERSION, false );
	}

	private function migrate_css_var_names(): void {
		$options = get_option( 'phantom_options', array() );
		$legacy_map = array(
			'primary_color'    => 'color_primary',
			'secondary_color'  => 'color_secondary',
			'accent_color'     => 'color_accent',
			'text_color'       => 'color_text',
			'heading_color'    => 'color_heading',
			'background_color' => 'color_background',
			'link_color'       => 'color_link',
			'link_hover_color' => 'color_link_hover',
			'border_color'     => 'color_border',
			'woo_primary'      => 'color_primary',
			'woo_rating_color' => 'color_rating',
		);

		$changed = false;
		foreach ( $legacy_map as $old_key => $new_key ) {
			if ( isset( $options[ $old_key ] ) && ! isset( $options[ $new_key ] ) ) {
				$options[ $new_key ] = $options[ $old_key ];
				$changed = true;
			}
		}

		if ( $changed ) {
			update_option( 'phantom_options', $options, false );
		}
	}
}
