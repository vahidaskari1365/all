<?php

declare(strict_types=1);

namespace App\Services;

use chillerlan\QRCode\Data\Byte;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

/**
 * تولید QR اختصاصی کارت — خروجی PNG سمت سرور
 * ماتریس QR با chillerlan/php-qrcode ساخته می‌شود و PNG بدون نیاز به GD
 * با انکودر سبک این سرویس بسته‌بندی می‌شود (سازگار با PHP 8.3).
 */
class QrGeneratorService
{
    public function pngBinary(string $text, int $size = 512): string
    {
        $options = new QROptions([
            'eccLevel' => QRCode::ECC_M,
        ]);

        // نکته: در chillerlan 5.x متد getMatrix() آرگومان نمی‌گیرد — سگمنت دیتا باید صریح افزوده شود
        $qrCode = new QRCode($options);
        $qrCode->addSegment(new Byte($text));
        $matrix = $qrCode->getQRMatrix()->getMatrix(true);
        $moduleCount = count($matrix[0]);

        // مقیاس: نزدیک‌ترین مضرب ۲ به اندازه خواسته
        $scale = max(2, 2 * (int) max(1, round($size / ($moduleCount * 4))));
        $quiet = 2; // حاشیه سفید (ماژول)
        $dim = ($moduleCount + $quiet * 2) * $scale;

        // بوم سفید
        $white = [255, 255, 255];
        $black = [0, 0, 0];
        $pixels = array_fill(0, $dim, array_fill(0, $dim, $white));

        foreach ($matrix as $my => $row) {
            foreach ($row as $mx => $dark) {
                if (! $dark) {
                    continue;
                }
                for ($sy = 0; $sy < $scale; $sy++) {
                    $py = ($my + $quiet) * $scale + $sy;
                    if ($py >= $dim) {
                        break;
                    }
                    for ($sx = 0; $sx < $scale; $sx++) {
                        $px = ($mx + $quiet) * $scale + $sx;
                        if ($px < $dim) {
                            $pixels[$py][$px] = $black;
                        }
                    }
                }
            }
        }

        return $this->encodePng($pixels, $dim, $dim);
    }

    /** انکودر سبک PNG (RGB 8-bit، بدون فیلتر) — بدون وابستگی به GD */
    private function encodePng(array $pixels, int $w, int $h): string
    {
        $raw = '';
        foreach ($pixels as $row) {
            $raw .= "\x00"; // فیلتر 0
            foreach ($row as [$r, $g, $b]) {
                $raw .= chr($r).chr($g).chr($b);
            }
        }

        $chunk = static fn (string $type, string $data): string => pack('N', strlen($data)).$type.$data.pack('N', crc32($type.$data));

        $ihdr = pack('N2C5', $w, $h, 8, 2, 0, 0, 0); // bit depth 8، color type 2 (RGB)

        return "\x89PNG\r\n\x1a\n"
            .$chunk('IHDR', $ihdr)
            .$chunk('IDAT', gzcompress($raw, 6))
            .$chunk('IEND', '');
    }
}
