/**
 * Demo verileri — Visibility Grid, Dashboard ve senaryo sayfaları buradan beslenir.
 * Gerçek API entegrasyonunda yalnızca bu dosya değişir.
 */
(function () {
  const gridSize = 7;
  const center7 = 3;

  const rankPattern = [
    [18, 14, 11, 9, 12, 15, 20],
    [13, 8, 5, 4, 6, 10, 16],
    [10, 6, 3, 2, 4, 7, 12],
    [9, 4, 2, 1, 3, 5, 11],
    [11, 5, 3, 2, 4, 8, 14],
    [15, 9, 7, 5, 6, 10, 17],
    [19, 14, 12, 10, 13, 16, 22],
  ];

  function cellsFromMatrix(matrix) {
    const size = matrix.length;
    const center = Math.floor(size / 2);
    const cells = [];
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        cells.push({
          row,
          col,
          rank: matrix[row][col],
          isBusiness: row === center && col === center,
        });
      }
    }
    return cells;
  }

  function buildGrid(matrix) {
    return {
      gridSize: matrix.length,
      cells: cellsFromMatrix(matrix),
    };
  }

  const homeCells = [];
  for (let row = 0; row < gridSize; row += 1) {
    for (let col = 0; col < gridSize; col += 1) {
      homeCells.push({
        row,
        col,
        rank: rankPattern[row][col],
        isBusiness: row === center7 && col === center7,
      });
    }
  }

  window.KonumDemoData = {
    visibilityGrid: {
      business: "Kahve Durağı Moda",
      area: "Kadıköy / Moda",
      query: "moda kahve",
      gridSize,
      cells: homeCells,
      insights: {
        observation:
          "Dükkanınızın önünde görünürsünüz; ancak Moda Caddesi ve Sahil yönündeki aramalarda sıralama 10–20 bandına düşüyor. Geniş hizmet alanı seçimi bu dağılımı zayıflatıyor.",
        action:
          "Hizmet alanını 5–7 hedef mahalleyle daraltın; kategori ve yorum tazeliğini bu bölgelere odaklayın. Grid takibiyle hangi sokakta kayıp yaşadığınızı aylık izleyin.",
      },
    },
    dashboard: {
      business: "Kahve Durağı Moda",
      period: "Son 30 gün (örnek)",
      metrics: [
        {
          id: "visibility-score",
          label: "Bölgesel görünürlük skoru",
          value: 62,
          unit: "/100",
          trend: "up",
          trendLabel: "+8 puan",
        },
        {
          id: "phone-trend",
          label: "Telefon eğilimi",
          value: 18,
          unit: "%",
          trend: "up",
          trendLabel: "Sektör bandının üstü",
        },
        {
          id: "directions-trend",
          label: "Yol tarifi eğilimi",
          value: 24,
          unit: "%",
          trend: "up",
          trendLabel: "Artış eğilimi",
        },
        {
          id: "review-freshness",
          label: "Yorum tazeliği",
          value: 78,
          unit: "/100",
          trend: "flat",
          trendLabel: "Stabil",
        },
        {
          id: "profile-completeness",
          label: "Profil tamlığı",
          value: 84,
          unit: "%",
          trend: "up",
          trendLabel: "3 alan eksik",
        },
        {
          id: "recommended-actions",
          label: "Önerilen aksiyonlar",
          value: 4,
          unit: "adım",
          trend: "neutral",
          trendLabel: "Bu ay öncelik",
          actions: [
            "Moda ve Caferağa için hizmet alanı güncellemesi",
            "Son 90 günde 6 yeni yorum hedefi",
            "Haftalık gerçek mekân fotoğrafı",
            "Web sitesi konum sayfası hizalaması",
          ],
        },
      ],
    },
    scenarios: {
      "moda-dis-klinigi": {
        business: "Moda Diş Kliniği",
        area: "Kadıköy / Moda",
        query: "moda diş kliniği",
        before: buildGrid([
          [22, 19, 17, 18, 20],
          [18, 15, 13, 14, 17],
          [16, 12, 11, 13, 15],
          [17, 14, 12, 14, 16],
          [21, 18, 16, 17, 19],
        ]),
        after: buildGrid([
          [6, 5, 4, 5, 7],
          [5, 4, 3, 4, 6],
          [4, 3, 2, 3, 5],
          [5, 3, 2, 4, 6],
          [7, 5, 4, 5, 8],
        ]),
      },
      "beyoglu-burger": {
        business: "Beyoğlu Burger",
        area: "Beyoğlu / Cihangir",
        query: "cihangir burger",
        before: buildGrid([
          [21, 18, 16, 17, 19],
          [17, 14, 12, 13, 16],
          [15, 11, 10, 12, 14],
          [16, 13, 11, 13, 15],
          [20, 17, 15, 16, 18],
        ]),
        after: buildGrid([
          [5, 4, 3, 4, 6],
          [4, 3, 2, 3, 5],
          [3, 2, 1, 2, 4],
          [4, 3, 2, 3, 5],
          [6, 4, 3, 4, 7],
        ]),
      },
      "sisli-estetik-merkezi": {
        business: "Şişli Estetik Merkezi",
        area: "Şişli / Mecidiyeköy",
        query: "şişli estetik merkezi",
        before: buildGrid([
          [23, 20, 18, 19, 21],
          [19, 16, 14, 15, 18],
          [17, 13, 12, 14, 16],
          [18, 15, 13, 15, 17],
          [22, 19, 17, 18, 20],
        ]),
        after: buildGrid([
          [7, 5, 4, 5, 8],
          [5, 4, 3, 4, 6],
          [4, 3, 2, 3, 5],
          [5, 4, 3, 4, 6],
          [8, 6, 5, 6, 9],
        ]),
      },
    },
  };
})();
