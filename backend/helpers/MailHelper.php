<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

class MailHelper {
    /**
     * Obtiene la configuración de correo desde la base de datos
     */
    private static function getMailConfig() {
        global $db;
        $stmt = $db->query("SELECT * FROM ajustes LIMIT 1");
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Envía un correo de actualización de estado de pedido usando SMTP con PHPMailer
     */
    public static function sendStatusUpdateEmail($to, $nombre, $numeroPedido, $nuevoEstado, $total = 0, $items = [], $shipping = null) {
        $config = self::getMailConfig();
        if (!$config) {
            error_log("Error: No se pudo cargar la configuración de correo desde la DB.");
            return ['success' => false, 'message' => 'Configuración de correo no encontrada'];
        }
        
        $mail = new PHPMailer(true);

        try {
            // Mapeo de slugs a etiquetas amigables
            $statusLabels = [
                'pendiente' => 'Pendiente',
                'pendiente_verificacion' => 'Pendiente de Verificación',
                'pagado' => 'Pagado',
                'en_preparacion' => 'En Preparación',
                'enviado' => 'Enviado',
                'listo_recoger' => 'Listo para recoger',
                'entregado' => 'Entregado',
                'completado' => 'Completado',
                'cancelado' => 'Cancelado',
                'devuelto' => 'Devuelto'
            ];

            $labelEstado = $statusLabels[$nuevoEstado] ?? ucfirst(str_replace('_', ' ', $nuevoEstado));

            // Configuración del servidor
            $mail->isSMTP();
            $mail->Host       = $config['smtp_host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $config['smtp_user'];
            $mail->Password   = $config['smtp_pass'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $config['smtp_port'];
            $mail->CharSet    = 'UTF-8';

            // Destinatarios
            $mail->setFrom($config['correo_contacto'], $config['nombre_empresa']);
            $mail->addAddress($to, $nombre);

            // Colores según estado
            $color = "#f97316"; // naranja por defecto
            if (in_array($nuevoEstado, ['entregado', 'completado'])) $color = "#22c55e";
            if ($nuevoEstado == 'cancelado') $color = "#ef4444";
            if ($nuevoEstado == 'enviado') $color = "#3b82f6";
            if ($nuevoEstado == 'listo_recoger') $color = "#8b5cf6";

            // Cálculos y Lista de Productos (si se proporcionan)
            $itemsHtml = "";
            $subtotal_neto = $total / 1.18;
            $igv = $total - $subtotal_neto;
            $total_ahorro = 0;

            if (!empty($items)) {
                $itemsHtml = "
                <table border='0' cellpadding='0' cellspacing='0' width='100%' style='margin-bottom: 30px; margin-top: 20px;'>
                    <thead>
                        <tr>
                            <th align='left' style='padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;'>Producto</th>
                            <th align='right' style='padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;'>Total</th>
                        </tr>
                    </thead>
                    <tbody>";

                foreach ($items as $item) {
                    $itemName = is_array($item) ? ($item['nombre'] ?? 'Producto') : ($item->nombre ?? 'Producto');
                    $itemCant = is_array($item) ? ($item['cantidad'] ?? 1) : ($item->cantidad ?? 1);
                    $itemPrice = is_array($item) ? ($item['precio'] ?? 0) : ($item->precio ?? 0);
                    $itemRegular = is_array($item) ? ($item['precio_regular'] ?? $itemPrice) : ($item->precio_regular ?? $itemPrice);
                    $itemVar = is_array($item) ? ($item['variacion_nombre'] ?? '') : ($item->variacion_nombre ?? '');
                    
                    $itemSubtotal = $itemCant * $itemPrice;
                    $ahorroItem = ($itemRegular - $itemPrice) * $itemCant;
                    if ($ahorroItem > 0) $total_ahorro += $ahorroItem;

                    $itemsHtml .= "
                    <tr>
                        <td style='padding: 12px 0; border-bottom: 1px solid #f1f5f9;'>
                            <p style='margin: 0; color: #1e293b; font-size: 14px; font-weight: 600;'>$itemName</p>";
                    
                    if ($itemVar) {
                        $itemsHtml .= "<p style='margin: 2px 0 0 0; color: #f97316; font-size: 12px; font-weight: 600;'>$itemVar</p>";
                    }

                    $itemPriceHtml = "S/ " . number_format($itemPrice, 2);
                    if ($itemRegular > $itemPrice) {
                        $itemPriceHtml = "<span style='text-decoration: line-through; color: #94a3b8; margin-right: 5px;'>S/ " . number_format($itemRegular, 2) . "</span>" . $itemPriceHtml;
                    }

                    $itemsHtml .= "<p style='margin: 4px 0 0 0; color: #64748b; font-size: 11px;'>Precio Unitario: $itemPriceHtml &times; $itemCant</p>";
                    
                    if ($ahorroItem > 0) {
                        $itemsHtml .= "<p style='margin: 2px 0 0 0; color: #22c55e; font-size: 11px; font-weight: 700;'>¡Ahorraste S/ ".number_format($ahorroItem, 2)."!</p>";
                    }

                    $itemsHtml .= "</td>
                        <td align='right' style='padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 14px; font-weight: 700;'>
                            S/ ".number_format($itemSubtotal, 2)."
                        </td>
                    </tr>";
                }
                $itemsHtml .= "</tbody></table>";
            }

            // Datos de envío
            $shippingHtml = "";
            if ($shipping) {
                $shipNombre = is_array($shipping) ? ($shipping['nombre'] ?? '') : ($shipping->nombre ?? '');
                $shipDir = is_array($shipping) ? ($shipping['direccion'] ?? '') : ($shipping->direccion ?? '');
                $shipDist = is_array($shipping) ? ($shipping['distrito'] ?? '') : ($shipping->distrito ?? '');
                $shipProv = is_array($shipping) ? ($shipping['provincia'] ?? '') : ($shipping->provincia ?? '');
                $shipRef = is_array($shipping) ? ($shipping['referencia'] ?? '') : ($shipping->referencia ?? '');

                if ($shipDir) {
                    $shippingHtml = "
                    <div style='margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;'>
                        <p style='margin: 0 0 10px 0; font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;'>Enviar a:</p>
                        <p style='margin: 0; color: #1e293b; font-size: 14px; font-weight: 700;'>$shipNombre</p>
                        <p style='margin: 4px 0 0 0; color: #64748b; font-size: 13px;'>$shipDir, $shipDist - $shipProv</p>";
                    if ($shipRef) {
                        $shippingHtml .= "<p style='margin: 4px 0 0 0; color: #64748b; font-size: 12px; font-style: italic;'>Ref: $shipRef</p>";
                    }
                    $shippingHtml .= "</div>";
                }
            }

            $resumenTotales = "";
            if ($total > 0) {
                $resumenTotales = "
                <table border='0' cellpadding='0' cellspacing='0' width='100%' style='background-color: #ffffff; border: 2px solid #f1f5f9; border-radius: 12px; padding: 25px;'>
                    <tr>
                        <td style='padding-top: 5px;'>
                            <span style='color: #64748b; font-size: 14px;'>Subtotal (Neto):</span>
                        </td>
                        <td align='right' style='padding-top: 5px;'>
                            <span style='color: #1e293b; font-size: 14px;'>S/ ".number_format($subtotal_neto, 2)."</span>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding-bottom: 10px;'>
                            <span style='color: #64748b; font-size: 14px;'>IGV (18%):</span>
                        </td>
                        <td align='right' style='padding-bottom: 10px;'>
                            <span style='color: #1e293b; font-size: 14px;'>S/ ".number_format($igv, 2)."</span>
                        </td>
                    </tr>";
                
                if ($total_ahorro > 0) {
                    $resumenTotales .= "
                    <tr>
                        <td style='padding-bottom: 15px;'>
                            <span style='color: #22c55e; font-size: 14px; font-weight: 700;'>Tu Ahorro Total:</span>
                        </td>
                        <td align='right' style='padding-bottom: 15px;'>
                            <span style='color: #22c55e; font-size: 14px; font-weight: 700;'>- S/ ".number_format($total_ahorro, 2)."</span>
                        </td>
                    </tr>";
                }

                $resumenTotales .= "
                    <tr>
                        <td style='border-top: 2px solid #e2e8f0; padding-top: 15px;'>
                            <span style='color: #1e293b; font-size: 16px; font-weight: 800;'>Total del Pedido:</span>
                        </td>
                        <td align='right' style='border-top: 2px solid #e2e8f0; padding-top: 15px;'>
                            <span style='color: #f97316; font-size: 24px; font-weight: 900;'>S/ ".number_format($total, 2)."</span>
                        </td>
                    </tr>
                </table>";
            }

            // Contenido HTML
            $htmlContent = "
            <!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
            <html>
            <body style='margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif;'>
                <table border='0' cellpadding='0' cellspacing='0' width='100%'>
                    <tr>
                        <td align='center' style='padding: 40px 0;'>
                            <table border='0' cellpadding='0' cellspacing='0' width='600' style='background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;'>
                                <tr>
                                    <td align='center' style='padding: 30px 0; border-bottom: 2px solid #f8fafc;'>
                                        <h1 style='margin: 0; color: #1e293b; font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;'>
                                            TIENDA<span style='color: #f97316;'>TEC</span>
                                        </h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='padding: 40px 50px;'>
                                        <h2 style='margin: 0 0 15px 0; color: #1e293b; font-size: 20px; font-weight: 800;'>¡Hola, $nombre!</h2>
                                        <p style='margin: 0 0 35px 0; color: #64748b; font-size: 16px; line-height: 1.6;'>
                                            Te informamos que el estado de tu pedido ha sido actualizado. Estamos trabajando para que lo recibas lo antes posible.
                                        </p>
                                        
                                        <table border='0' cellpadding='0' cellspacing='0' width='100%' style='margin-bottom: 40px;'>
                                            <tr>
                                                <td align='center' style='padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;'>
                                                    <p style='margin: 0 0 10px 0; font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;'>Nuevo Estado</p>
                                                    <span style='background-color: $color; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: 900; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; display: inline-block;'>
                                                        $labelEstado
                                                    </span>
                                                    <p style='margin: 15px 0 0 0; font-size: 13px; color: #64748b;'>Pedido #$numeroPedido</p>
                                                </td>
                                            </tr>
                                        </table>

                                        $itemsHtml
                                        $resumenTotales
                                        $shippingHtml

                                        <p style='margin: 35px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;'>
                                            Puedes seguir el progreso de tu compra en tiempo real desde nuestra plataforma.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align='center' style='padding: 40px 50px; background-color: #1e293b; color: #ffffff;'>
                                        <a href='http://localhost:5173/mis-pedidos' style='background-color: #f97316; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;'>Ver mi pedido</a>
                                        <p style='margin: 30px 0 0 0; font-size: 12px; color: #94a3b8;'>&copy; 2025 TiendaTEC. <br/>Notificación de sistema.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            ";

            $mail->isHTML(true);
            $mail->Subject = "ACTUALIZACIÓN 🚀: Tu Pedido $numeroPedido está $labelEstado - TiendaTEC";
            $mail->Body    = $htmlContent;
            $mail->AltBody = "Tu pedido $numeroPedido ha cambiado al estado: $labelEstado. Visita la web para ver los detalles.";

            $success = $mail->send();
            return ['success' => $success, 'message' => $success ? 'Correo enviado' : $mail->ErrorInfo];
        } catch (Exception $e) {
            $errorMsg = $mail->ErrorInfo ?: $e->getMessage();
            error_log("Error en PHPMailer (Status): " . $errorMsg);
            return ['success' => false, 'message' => $errorMsg];
        }
    }

    /**
     * Envía un correo de confirmación de pedido recibido (Checkout)
     */
    public static function sendOrderConfirmationEmail($to, $nombre, $numeroPedido, $total, $items = [], $shipping = null) {
        $config = self::getMailConfig();
        if (!$config) {
            error_log("Error: No se pudo cargar la configuración de correo desde la DB.");
            return ['success' => false, 'message' => 'Configuración de correo no encontrada'];
        }

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = $config['smtp_host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $config['smtp_user'];
            $mail->Password   = $config['smtp_pass'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $config['smtp_port'];
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom($config['correo_contacto'], $config['nombre_empresa']);
            $mail->addAddress($to, $nombre);

            // Cálculos
            $subtotal_neto = $total / 1.18;
            $igv = $total - $subtotal_neto;
            $total_ahorro = 0;

            // Construir lista de productos
            $itemsHtml = "";
            foreach ($items as $item) {
                // El item puede venir del frontend como objeto o del backend como array
                $itemName = is_array($item) ? ($item['nombre'] ?? 'Producto') : ($item->nombre ?? 'Producto');
                $itemCant = is_array($item) ? ($item['cantidad'] ?? 1) : ($item->cantidad ?? 1);
                $itemPrice = is_array($item) ? ($item['precio'] ?? 0) : ($item->precio ?? 0);
                $itemRegular = is_array($item) ? ($item['precio_regular'] ?? $itemPrice) : ($item->precio_regular ?? $itemPrice);
                $itemVar = is_array($item) ? ($item['variacion_nombre'] ?? '') : ($item->variacion_nombre ?? '');
                
                $itemSubtotal = $itemCant * $itemPrice;
                $ahorroItem = ($itemRegular - $itemPrice) * $itemCant;
                if ($ahorroItem > 0) $total_ahorro += $ahorroItem;

                $itemsHtml .= "
                <tr>
                    <td style='padding: 12px 0; border-bottom: 1px solid #f1f5f9;'>
                        <p style='margin: 0; color: #1e293b; font-size: 14px; font-weight: 600;'>$itemName</p>";
                
                if ($itemVar) {
                    $itemsHtml .= "<p style='margin: 2px 0 0 0; color: #f97316; font-size: 12px; font-weight: 600;'>$itemVar</p>";
                }

                $itemPriceHtml = "S/ " . number_format($itemPrice, 2);
                if ($itemRegular > $itemPrice) {
                    $itemPriceHtml = "<span style='text-decoration: line-through; color: #94a3b8; margin-right: 5px;'>S/ " . number_format($itemRegular, 2) . "</span>" . $itemPriceHtml;
                }

                $itemsHtml .= "<p style='margin: 4px 0 0 0; color: #64748b; font-size: 11px;'>Precio Unitario: $itemPriceHtml &times; $itemCant</p>";
                
                if ($ahorroItem > 0) {
                    $itemsHtml .= "<p style='margin: 2px 0 0 0; color: #22c55e; font-size: 11px; font-weight: 700;'>¡Ahorraste S/ ".number_format($ahorroItem, 2)."!</p>";
                }

                $itemsHtml .= "</td>
                    <td align='right' style='padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 14px; font-weight: 700;'>
                        S/ ".number_format($itemSubtotal, 2)."
                    </td>
                </tr>";
            }

            // Datos de envío
            $shippingHtml = "";
            if ($shipping) {
                $shipNombre = is_array($shipping) ? ($shipping['nombre'] ?? '') : ($shipping->nombre ?? '');
                $shipDir = is_array($shipping) ? ($shipping['direccion'] ?? '') : ($shipping->direccion ?? '');
                $shipDist = is_array($shipping) ? ($shipping['distrito'] ?? '') : ($shipping->distrito ?? '');
                $shipProv = is_array($shipping) ? ($shipping['provincia'] ?? '') : ($shipping->provincia ?? '');
                $shipRef = is_array($shipping) ? ($shipping['referencia'] ?? '') : ($shipping->referencia ?? '');

                if ($shipDir) {
                    $shippingHtml = "
                    <div style='margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;'>
                        <p style='margin: 0 0 10px 0; font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;'>Enviar a:</p>
                        <p style='margin: 0; color: #1e293b; font-size: 14px; font-weight: 700;'>$shipNombre</p>
                        <p style='margin: 4px 0 0 0; color: #64748b; font-size: 13px;'>$shipDir, $shipDist - $shipProv</p>";
                    if ($shipRef) {
                        $shippingHtml .= "<p style='margin: 4px 0 0 0; color: #64748b; font-size: 12px; font-style: italic;'>Ref: $shipRef</p>";
                    }
                    $shippingHtml .= "</div>";
                }
            }

            $htmlContent = "
            <!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
            <html>
            <body style='margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif;'>
                <table border='0' cellpadding='0' cellspacing='0' width='100%'>
                    <tr>
                        <td align='center' style='padding: 40px 0;'>
                            <table border='0' cellpadding='0' cellspacing='0' width='600' style='background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;'>
                                <tr>
                                    <td align='center' style='padding: 30px 0; border-bottom: 2px solid #f8fafc;'>
                                        <h1 style='margin: 0; color: #1e293b; font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;'>
                                            TIENDA<span style='color: #f97316;'>TEC</span>
                                        </h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='padding: 40px 50px;'>
                                        <h2 style='margin: 0 0 15px 0; color: #1e293b; font-size: 20px; font-weight: 800;'>¡Gracias por tu compra, $nombre!</h2>
                                        <p style='margin: 0 0 35px 0; color: #64748b; font-size: 16px; line-height: 1.6;'>
                                            Hemos recibido tu pedido correctamente. Aquí tienes el resumen detallado de tu orden:
                                        </p>
                                        
                                        <table border='0' cellpadding='0' cellspacing='0' width='100%' style='margin-bottom: 30px;'>
                                            <thead>
                                                <tr>
                                                    <th align='left' style='padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;'>Producto</th>
                                                    <th align='right' style='padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;'>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                $itemsHtml
                                            </tbody>
                                        </table>

                                        <table border='0' cellpadding='0' cellspacing='0' width='100%' style='background-color: #ffffff; border: 2px solid #f1f5f9; border-radius: 12px; padding: 25px;'>
                                            <tr>
                                                <td style='padding-bottom: 10px;'>
                                                    <span style='color: #64748b; font-size: 14px;'>Número de Pedido:</span>
                                                </td>
                                                <td align='right' style='padding-bottom: 10px;'>
                                                    <span style='color: #1e293b; font-size: 14px; font-weight: 700;'>$numeroPedido</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='padding-bottom: 5px; border-top: 1px solid #f1f5f9; padding-top: 15px;'>
                                                    <span style='color: #64748b; font-size: 14px;'>Subtotal (Neto):</span>
                                                </td>
                                                <td align='right' style='padding-bottom: 5px; border-top: 1px solid #f1f5f9; padding-top: 15px;'>
                                                    <span style='color: #1e293b; font-size: 14px;'>S/ ".number_format($subtotal_neto, 2)."</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='padding-bottom: 10px;'>
                                                    <span style='color: #64748b; font-size: 14px;'>IGV (18%):</span>
                                                </td>
                                                <td align='right' style='padding-bottom: 10px;'>
                                                    <span style='color: #1e293b; font-size: 14px;'>S/ ".number_format($igv, 2)."</span>
                                                </td>
                                            </tr>";

            if ($total_ahorro > 0) {
                $htmlContent .= "
                                            <tr>
                                                <td style='padding-bottom: 15px;'>
                                                    <span style='color: #22c55e; font-size: 14px; font-weight: 700;'>Tu Ahorro Total:</span>
                                                </td>
                                                <td align='right' style='padding-bottom: 15px;'>
                                                    <span style='color: #22c55e; font-size: 14px; font-weight: 700;'>- S/ ".number_format($total_ahorro, 2)."</span>
                                                </td>
                                            </tr>";
            }

            $htmlContent .= "
                                            <tr>
                                                <td style='border-top: 2px solid #e2e8f0; padding-top: 15px;'>
                                                    <span style='color: #1e293b; font-size: 16px; font-weight: 800;'>Total Final:</span>
                                                </td>
                                                <td align='right' style='border-top: 2px solid #e2e8f0; padding-top: 15px;'>
                                                    <span style='color: #f97316; font-size: 24px; font-weight: 900;'>S/ ".number_format($total, 2)."</span>
                                                </td>
                                            </tr>
                                        </table>

                                        $shippingHtml

                                        <p style='margin: 35px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;'>
                                            Te enviaremos otro correo cuando el estado de tu pedido cambie. ¡Que lo disfrutes mucho!
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align='center' style='padding: 40px 50px; background-color: #1e293b; color: #ffffff;'>
                                        <a href='http://localhost:5173/mis-pedidos' style='background-color: #f97316; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;'>Gestionar mi pedido</a>
                                        <p style='margin: 30px 0 0 0; font-size: 12px; color: #94a3b8;'>&copy; 2025 TiendaTEC. <br/>Tecnología a tu alcance.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            ";

            $mail->isHTML(true);
            $mail->Subject = "📦 ¡Pedido Confirmado! $numeroPedido - TiendaTEC";
            $mail->Body    = $htmlContent;
            $mail->AltBody = "Gracias por tu compra $nombre. Tu pedido $numeroPedido ha sido recibido con un total de S/ ".number_format($total, 2);

            $success = $mail->send();
            return ['success' => $success, 'message' => $success ? 'Correo enviado' : $mail->ErrorInfo];
        } catch (Exception $e) {
            error_log("Error en PHPMailer (Confirmación): " . $mail->ErrorInfo);
            return ['success' => false, 'message' => $mail->ErrorInfo];
        }
    }
    /**
     * Envía un correo de bienvenida a un nuevo usuario
     */
    public static function sendWelcomeEmail($to, $nombre) {
        $config = self::getMailConfig();
        if (!$config) {
            error_log("Error: No se pudo cargar la configuración de correo desde la DB.");
            return ['success' => false, 'message' => 'Configuración de correo no encontrada'];
        }

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = $config['smtp_host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $config['smtp_user'];
            $mail->Password   = $config['smtp_pass'];
            if ($config['smtp_port'] == 465) {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            } else {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            }
            $mail->Port       = $config['smtp_port'];
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom($config['correo_contacto'], $config['nombre_empresa']);
            $mail->addAddress($to, $nombre);

            $htmlContent = "
            <!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
            <html>
            <body style='margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif;'>
                <table border='0' cellpadding='0' cellspacing='0' width='100%'>
                    <tr>
                        <td align='center' style='padding: 40px 0;'>
                            <table border='0' cellpadding='0' cellspacing='0' width='600' style='background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;'>
                                <tr>
                                    <td align='center' style='padding: 30px 0; border-bottom: 2px solid #f8fafc;'>
                                        <h1 style='margin: 0; color: #1e293b; font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;'>
                                            TIENDA<span style='color: #f97316;'>TEC</span>
                                        </h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='padding: 40px 50px;'>
                                        <h2 style='margin: 0 0 15px 0; color: #1e293b; font-size: 20px; font-weight: 800;'>¡Bienvenido(a) a TiendaTEC, $nombre!</h2>
                                        <p style='margin: 0 0 25px 0; color: #64748b; font-size: 16px; line-height: 1.6;'>
                                            Estamos muy emocionados de tenerte con nosotros. En TiendaTEC encontrarás la mejor tecnología a los mejores precios.
                                        </p>
                                        <div style='background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 25px; margin-bottom: 30px;'>
                                            <p style='margin: 0 0 15px 0; color: #c2410c; font-weight: 700; font-size: 16px;'>¿Qué puedes hacer ahora?</p>
                                            <ul style='margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.8;'>
                                                <li>Explorar nuestro catálogo de productos.</li>
                                                <li>Realizar tus compras de forma segura.</li>
                                                <li>Acceder a servicios técnicos especializados.</li>
                                                <li>Seguir tus pedidos en tiempo real.</li>
                                            </ul>
                                        </div>
                                        <p style='margin: 0 0 35px 0; color: #64748b; font-size: 14px; line-height: 1.6;'>
                                            ¿Listo para empezar? Haz clic en el siguiente botón para ver nuestras ofertas actuales.
                                        </p>
                                        <table border='0' cellpadding='0' cellspacing='0' width='100%'>
                                            <tr>
                                                <td align='center'>
                                                    <a href='http://localhost:5173/productos' style='background-color: #f97316; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;'>Ver Catálogo de Productos</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align='center' style='padding: 40px 50px; background-color: #1e293b; color: #ffffff;'>
                                        <p style='margin: 0 0 15px 0; font-size: 14px;'>Síguenos en nuestras redes sociales</p>
                                        <p style='margin: 0; font-size: 12px; color: #94a3b8;'>&copy; 2025 TiendaTEC. <br/>Calidad y tecnología a tu alcance.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            ";

            $mail->isHTML(true);
            $mail->Subject = "¡Bienvenido a TiendaTEC! - Tu tecnología al mejor precio";
            $mail->Body    = $htmlContent;
            $mail->AltBody = "¡Bienvenido a TiendaTEC, $nombre! Explora nuestro catálogo en http://localhost:5173/productos";

            $success = $mail->send();
            return ['success' => $success, 'message' => $success ? 'Correo de bienvenida enviado' : $mail->ErrorInfo];
        } catch (Exception $e) {
            $errorMsg = $mail->ErrorInfo ?: $e->getMessage();
            error_log("Error en PHPMailer (sendWelcomeEmail): " . $errorMsg);
            return ['success' => false, 'message' => $errorMsg];
        }
    }

    /**
     * Genera el HTML para un correo promocional
     */
    public static function getPromotionHtml($nombre, $promoNombre, $productos) {
        $productosHtml = "";
        foreach ($productos as $prod) {
            $precioOriginal = number_format($prod['precio_base'], 2);
            $precioDescuento = number_format($prod['precio_final'], 2);
            $descuentoInfo = $prod['descuento_valor'] . ($prod['descuento_tipo'] == 'porcentaje' ? '%' : ' S/');
            
            // Dado que el sistema está en LOCAL, las imágenes no son visibles en internet.
            // Usamos un servicio de placeholder con el nombre del producto para que el correo se vea bien.
            $nombreUrl = urlencode($prod['nombre']);
            $imagen = "https://placehold.co/400x400/1e293b/ffffff?text=" . $nombreUrl;
            
            $productosHtml .= "
            <div style='display: inline-block; width: 250px; margin: 10px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; vertical-align: top; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'>
                <div style='height: 200px; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; overflow: hidden;'>
                    <img src='$imagen' alt='".htmlspecialchars($prod['nombre'])."' style='max-width: 100%; max-height: 100%; object-fit: cover;'>
                </div>
                <div style='padding: 15px;'>
                    <div style='background-color: #fef2f2; color: #ef4444; font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 6px; display: inline-block; margin-bottom: 8px; text-transform: uppercase;'>-$descuentoInfo</div>
                    <h3 style='margin: 0 0 10px 0; color: #1e293b; font-size: 14px; font-weight: 700; height: 40px; overflow: hidden;'>".htmlspecialchars($prod['nombre'])."</h3>
                    <div style='display: flex; align-items: baseline;'>
                        <span style='color: #f97316; font-size: 18px; font-weight: 900;'>S/ $precioDescuento</span>
                        <span style='color: #94a3b8; font-size: 12px; text-decoration: line-through; margin-left: 8px;'>S/ $precioOriginal</span>
                    </div>
                    <a href='http://localhost:5173/producto/{$prod['id']}' style='display: block; width: 100%; padding: 10px 0; background-color: #1e293b; color: #ffffff; text-align: center; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: 700; margin-top: 15px; text-transform: uppercase;'>Ver Oferta</a>
                </div>
            </div>";
        }

        return "
        <!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
        <html>
        <body style='margin: 0; padding: 0; background-color: #f0f2f5; font-family: sans-serif;'>
            <table border='0' cellpadding='0' cellspacing='0' width='100%'>
                <tr>
                    <td align='center' style='padding: 30px 0;'>
                        <table border='0' cellpadding='0' cellspacing='0' width='650' style='background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);'>
                            <tr>
                                <td align='center' style='padding: 40px 0; background: linear-gradient(135deg, #1e293b 0%, #334155 100%);'>
                                    <h1 style='margin: 0; color: #ffffff; font-size: 18px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase;'>Tienda<span style='color: #f97316; font-weight: 900;'>TEC</span></h1>
                                    <h2 style='margin: 15px 0 0 0; color: #ffffff; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;'>¡Nuevas Ofertas para ti!</h2>
                                    <div style='height: 4px; width: 60px; background-color: #f97316; margin: 20px auto;'></div>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding: 40px;'>
                                    <p style='margin: 0 0 10px 0; color: #64748b; font-size: 16px;'>Hola ".htmlspecialchars($nombre).",</p>
                                    <p style='margin: 0 0 30px 0; color: #1e293b; font-size: 18px; font-weight: 500;'>Hemos activado una nueva promoción: <strong style='color: #f97316;'>".htmlspecialchars($promoNombre)."</strong>. ¡Mira los increíbles descuentos que tenemos para ti!</p>
                                    
                                    <div style='text-align: center;'>
                                        $productosHtml
                                    </div>

                                    <div style='margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 30px;'>
                                        <p style='color: #64748b; font-size: 14px; margin-bottom: 25px;'>Estas ofertas son por tiempo limitado. ¡No dejes pasar esta oportunidad!</p>
                                        <a href='http://localhost:5173/productos?ofertas=1' style='background-color: #f97316; color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.3);'>Ir a todas las ofertas</a>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td align='center' style='padding: 30px; background-color: #f8fafc; color: #94a3b8; font-size: 12px;'>
                                    <p style='margin: 0;'>&copy; 2025 TiendaTEC. Todos los derechos reservados.</p>
                                    <p style='margin: 5px 0 0 0;'>Si no deseas recibir más correos como este, puedes <a href='#' style='color: #94a3b8;'>darte de baja aquí</a>.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";
    }

    /**
     * Envía un correo promocional con tarjetas de productos
     */
    public static function sendPromotionEmail($to, $nombre, $promoNombre, $productos) {
        $config = self::getMailConfig();
        if (!$config) {
            error_log("Error: No se pudo cargar la configuración de correo desde la DB.");
            return ['success' => false, 'message' => 'Configuración de correo no encontrada'];
        }

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = $config['smtp_host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $config['smtp_user'];
            $mail->Password   = $config['smtp_pass'];
            if ($config['smtp_port'] == 465) {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            } else {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            }
            $mail->Port       = $config['smtp_port'];
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom($config['correo_contacto'], $config['nombre_empresa']);
            $mail->addAddress($to, $nombre);

            $htmlContent = self::getPromotionHtml($nombre, $promoNombre, $productos);

            $mail->isHTML(true);
            $mail->Subject = "🔥 ¡Nuevas Ofertas Disponibles! - $promoNombre";
            $mail->Body    = $htmlContent;
            $mail->AltBody = "¡Hola $nombre! Hemos activado una nueva promoción: $promoNombre. Visita TiendaTEC para ver las ofertas.";

            $success = $mail->send();
            return ['success' => $success, 'message' => $success ? 'Correo promocional enviado' : $mail->ErrorInfo];
        } catch (Exception $e) {
            $errorMsg = $mail->ErrorInfo ?: $e->getMessage();
            error_log("Error en PHPMailer (sendPromotionEmail): " . $errorMsg);
            return ['success' => false, 'message' => $errorMsg];
        }
    }

    /**
     * Envía un correo de recuperación de contraseña
     */
    public static function sendPasswordResetEmail($to, $nombre, $token) {
        $config = self::getMailConfig();
        if (!$config) {
            error_log("Error: No se pudo cargar la configuración de correo desde la DB.");
            return ['success' => false, 'message' => 'Configuración de correo no encontrada'];
        }

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = $config['smtp_host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $config['smtp_user'];
            $mail->Password   = $config['smtp_pass'];
            if ($config['smtp_port'] == 465) {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            } else {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            }
            $mail->Port       = $config['smtp_port'];
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom($config['correo_contacto'], $config['nombre_empresa']);
            $mail->addAddress($to, $nombre);

            $resetUrl = "http://localhost:5173/reset-password/$token";

            $htmlContent = "
            <!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
            <html>
            <body style='margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif;'>
                <table border='0' cellpadding='0' cellspacing='0' width='100%'>
                    <tr>
                        <td align='center' style='padding: 40px 0;'>
                            <table border='0' cellpadding='0' cellspacing='0' width='600' style='background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);'>
                                <tr>
                                    <td align='center' style='padding: 40px 0; border-bottom: 2px solid #f8fafc;'>
                                         <h1 style='margin: 0; color: #1e293b; font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;'>
                                            RED<span style='color: #f97316;'>HARD</span>
                                        </h1>
                                        <p style='margin: 5px 0 0 0; font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px;'>Security_Protocol_V2</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style='padding: 50px;'>
                                        <h2 style='margin: 0 0 15px 0; color: #1e293b; font-size: 20px; font-weight: 800;'>¿Olvidaste tu contraseña?</h2>
                                        <p style='margin: 0 0 30px 0; color: #64748b; font-size: 15px; line-height: 1.6;'>
                                            Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>RedHard.Net</strong>. No te preocupes, esto sucede. Haz clic en el botón de abajo para configurar una nueva clave.
                                        </p>
                                        
                                        <table border='0' cellpadding='0' cellspacing='0' width='100%' style='margin-bottom: 30px;'>
                                            <tr>
                                                <td align='center'>
                                                    <a href='$resetUrl' style='background-color: #f97316; color: #ffffff; padding: 18px 35px; text-decoration: none; border-radius: 14px; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.2);'>Restablecer_Clave_</a>
                                                </td>
                                            </tr>
                                        </table>

                                        <div style='background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px dashed #cbd5e1;'>
                                            <p style='margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;'>
                                                <strong>Importante:</strong> Este enlace expirará en 1 hora por motivos de seguridad. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align='center' style='padding: 40px 50px; background-color: #1e293b; color: #ffffff;'>
                                        <p style='margin: 0; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;'>RedHard Infosec Division</p>
                                        <p style='margin: 10px 0 0 0; font-size: 10px; color: #475569;'>&copy; 2025 RedHard.Net. Entorno_Cifrado_SSL.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            ";

            $mail->isHTML(true);
            $mail->Subject = "RESET_PASSWORD: Solicitud de Restablecimiento - RedHard";
            $mail->Body    = $htmlContent;
            $mail->AltBody = "Haz clic en el siguiente enlace para restablecer tu contraseña: $resetUrl";

            $success = $mail->send();
            return ['success' => $success, 'message' => $success ? 'Correo de recuperación enviado' : $mail->ErrorInfo];
        } catch (Exception $e) {
            $errorMsg = $mail->ErrorInfo ?: $e->getMessage();
            error_log("Error en PHPMailer (sendPasswordResetEmail): " . $errorMsg);
            return ['success' => false, 'message' => $errorMsg];
        }
    }

    /**
     * Envía un correo genérico usando la configuración SMTP de la base de datos
     */
    /**
     * Genera el HTML para un correo de baja de precio en carrito
     */
    public static function getPriceDropCartHtml($nombre, $productos) {
        $productosHtml = "";
        foreach ($productos as $prod) {
            $precioOriginal = number_format($prod['precio_base'], 2);
            $precioDescuento = number_format($prod['precio_final'], 2);
            $descuentoInfo = $prod['descuento_valor'] . ($prod['descuento_tipo'] == 'porcentaje' ? '%' : ' S/');
            
            $nombreUrl = urlencode($prod['nombre']);
            $imagen = "https://placehold.co/400x400/1e293b/ffffff?text=" . $nombreUrl;
            
            $productosHtml .= "
            <div style='display: inline-block; width: 250px; margin: 10px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; vertical-align: top; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'>
                <div style='height: 200px; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; overflow: hidden;'>
                    <img src='$imagen' alt='".htmlspecialchars($prod['nombre'])."' style='max-width: 100%; max-height: 100%; object-fit: cover;'>
                </div>
                <div style='padding: 15px;'>
                    <div style='background-color: #fef2f2; color: #ef4444; font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 6px; display: inline-block; margin-bottom: 8px; text-transform: uppercase;'>-$descuentoInfo</div>
                    <h3 style='margin: 0 0 10px 0; color: #1e293b; font-size: 14px; font-weight: 700; height: 40px; overflow: hidden;'>".htmlspecialchars($prod['nombre'])."</h3>
                    <div style='display: flex; align-items: baseline;'>
                        <span style='color: #f97316; font-size: 18px; font-weight: 900;'>S/ $precioDescuento</span>
                        <span style='color: #94a3b8; font-size: 12px; text-decoration: line-through; margin-left: 8px;'>S/ $precioOriginal</span>
                    </div>
                    <a href='http://localhost:5173/producto/{$prod['id']}' style='display: block; width: 100%; padding: 10px 0; background-color: #f97316; color: #ffffff; text-align: center; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: 700; margin-top: 15px; text-transform: uppercase;'>Comprar Ahora</a>
                </div>
            </div>";
        }

        return "
        <!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
        <html>
        <body style='margin: 0; padding: 0; background-color: #f0f2f5; font-family: sans-serif;'>
            <table border='0' cellpadding='0' cellspacing='0' width='100%'>
                <tr>
                    <td align='center' style='padding: 30px 0;'>
                        <table border='0' cellpadding='0' cellspacing='0' width='650' style='background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);'>
                            <tr>
                                <td align='center' style='padding: 40px 0; background: linear-gradient(135deg, #1e293b 0%, #334155 100%);'>
                                    <h1 style='margin: 0; color: #ffffff; font-size: 18px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase;'>Tienda<span style='color: #f97316; font-weight: 900;'>TEC</span></h1>
                                    <h2 style='margin: 15px 0 0 0; color: #ffffff; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;'>¡Baja de precio! 🛒</h2>
                                    <div style='height: 4px; width: 60px; background-color: #22c55e; margin: 20px auto;'></div>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding: 40px;'>
                                    <p style='margin: 0 0 10px 0; color: #64748b; font-size: 16px;'>Hola ".htmlspecialchars($nombre).",</p>
                                    <p style='margin: 0 0 30px 0; color: #1e293b; font-size: 18px; font-weight: 500;'>¡Buenas noticias! Algunos productos que guardaste en tu carrito acaban de **bajar de precio**. No pierdas la oportunidad de llevártelos ahora:</p>
                                    
                                    <div style='text-align: center;'>
                                        $productosHtml
                                    </div>

                                    <div style='margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 30px;'>
                                        <p style='color: #64748b; font-size: 14px; margin-bottom: 25px;'>Recuerda que estas ofertas pueden agotarse pronto.</p>
                                        <a href='http://localhost:5173/carrito' style='background-color: #f97316; color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.3);'>Ir a mi carrito</a>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td align='center' style='padding: 30px; background-color: #f8fafc; color: #94a3b8; font-size: 12px;'>
                                    <p style='margin: 0;'>&copy; 2025 TiendaTEC. Calidad y tecnología a un mejor precio.</p>
                                    <p style='margin: 5px 0 0 0;'>Recibiste este correo porque tienes estos productos en tu carrito.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";
    }

    /**
     * Envía un correo de baja de precio en carrito
     */
    public static function sendPriceDropCartEmail($to, $nombre, $productos) {
        $config = self::getMailConfig();
        if (!$config) return ['success' => false, 'message' => 'Configuración de correo no encontrada'];

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = $config['smtp_host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $config['smtp_user'];
            $mail->Password   = $config['smtp_pass'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $config['smtp_port'];
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom($config['correo_contacto'], $config['nombre_empresa']);
            $mail->addAddress($to, $nombre);

            $htmlContent = self::getPriceDropCartHtml($nombre, $productos);

            $mail->isHTML(true);
            $mail->Subject = "📉 ¡Baja de precio en tu carrito! - TiendaTEC";
            $mail->Body    = $htmlContent;
            $mail->AltBody = "¡Hola $nombre! Los productos en tu carrito han bajado de precio. Visita TiendaTEC para ver las ofertas.";

            $success = $mail->send();
            return ['success' => $success, 'message' => $success ? 'Correo enviado' : $mail->ErrorInfo];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $mail->ErrorInfo ?: $e->getMessage()];
        }
    }

    /**
     * Envía un correo genérico usando la configuración SMTP de la base de datos
     */
    public static function sendEmail($to, $subject, $body) {
        $config = self::getMailConfig();
        if (!$config) {
            error_log("Error: No se pudo cargar la configuración de correo desde la DB.");
            return false;
        }

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = $config['smtp_host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $config['smtp_user'];
            $mail->Password   = $config['smtp_pass'];
            if ($config['smtp_port'] == 465) {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            } else {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            }
            $mail->Port       = $config['smtp_port'];
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom($config['correo_contacto'], $config['nombre_empresa']);
            $mail->addAddress($to);

            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->AltBody = strip_tags($body);

            $success = $mail->send();
            return ['success' => $success, 'message' => $success ? 'Correo enviado' : $mail->ErrorInfo];
        } catch (Exception $e) {
            $errorMsg = $mail->ErrorInfo ?: $e->getMessage();
            error_log("Error en PHPMailer (sendEmail): " . $errorMsg);
            return ['success' => false, 'message' => $errorMsg];
        }
    }
}
