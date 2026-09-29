package com.communitycentre.controller;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/qr")
@CrossOrigin(origins = "*")
public class QrController {

    @Value("${app.frontend.baseUrl:http://localhost:5500}")
    private String frontendBaseUrl;

    /**
     * GET /api/qr/{roomId}
     * Returns a QR code PNG image for the given room.
     * The QR encodes: <frontendBaseUrl>/room.html?room_id=<roomId>
     */
    @GetMapping(value = "/{roomId}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> generateQr(@PathVariable Long roomId,
                                              @RequestParam(defaultValue = "250") int size)
            throws WriterException, IOException {

        String url = frontendBaseUrl + "/room.html?room_id=" + roomId;

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.MARGIN, 2);

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix bitMatrix = writer.encode(url, BarcodeFormat.QR_CODE, size, size, hints);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", out);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(out.toByteArray());
    }

    /**
     * GET /api/qr/{roomId}/url
     * Returns just the URL that the QR encodes (useful for debugging).
     */
    @GetMapping("/{roomId}/url")
    public ResponseEntity<Map<String, String>> getQrUrl(@PathVariable Long roomId) {
        String url = frontendBaseUrl + "/room.html?room_id=" + roomId;
        return ResponseEntity.ok(Map.of("roomId", roomId.toString(), "url", url));
    }
}
